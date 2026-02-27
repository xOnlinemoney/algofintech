#region Using declarations
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Threading;
using System.Xml.Linq;
using Newtonsoft.Json;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.Gui.Tools;
using NinjaTrader.NinjaScript;
#endregion

namespace NinjaTrader.Gui.NinjaScript
{
    // ═══════════════════════════════════════════════════════════════
    // Copier Tab — UI + Core Copy Logic
    // ═══════════════════════════════════════════════════════════════
    public class AlgoFintechCopierTab : NTTabPage
    {
        // ─── Configuration ───────────────────────────────────────
        private static readonly string ConfigDir  = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "NinjaTrader 8", "AlgoFintechCopier");
        private static readonly string ConfigFile = Path.Combine(ConfigDir, "config.json");
        private static readonly string LogFile    = Path.Combine(ConfigDir, "copier.log");

        // Optional: URL for logging trades to your AlgoFintech API
        private string apiBaseUrl = "http://localhost:3002";

        // ─── State ───────────────────────────────────────────────
        private CopierConfig     config;
        private Account          masterAccount;
        private bool             isRunning = false;
        private readonly object  lockObj = new object();

        // Track orders we've already copied to avoid duplicates
        private readonly HashSet<string> processedExecutionIds = new HashSet<string>();

        // ─── UI Controls ─────────────────────────────────────────
        private ComboBox     cboMasterAccount;
        private Button       btnStart;
        private Button       btnStop;
        private Button       btnRefreshAccounts;
        private TextBox      txtLog;
        private DataGrid     dgSlaveAccounts;
        private TextBlock     lblStatus;

        // ─── Constructor ─────────────────────────────────────────
        public AlgoFintechCopierTab()
        {
            // Ensure config directory exists
            if (!Directory.Exists(ConfigDir))
                Directory.CreateDirectory(ConfigDir);

            LoadConfig();
            BuildUI();
            RefreshAccountList();
        }

        // ═══════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════

        private void LoadConfig()
        {
            try
            {
                if (File.Exists(ConfigFile))
                {
                    string json = File.ReadAllText(ConfigFile);
                    config = JsonConvert.DeserializeObject<CopierConfig>(json);
                    Log("Config loaded from " + ConfigFile);
                }
                else
                {
                    config = new CopierConfig();
                    SaveConfig();
                    Log("Default config created at " + ConfigFile);
                }
            }
            catch (Exception ex)
            {
                config = new CopierConfig();
                Log("Error loading config: " + ex.Message);
            }
        }

        private void SaveConfig()
        {
            try
            {
                string json = JsonConvert.SerializeObject(config, Formatting.Indented);
                File.WriteAllText(ConfigFile, json);
            }
            catch (Exception ex)
            {
                Log("Error saving config: " + ex.Message);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // UI CONSTRUCTION (all in C#, no XAML needed)
        // ═══════════════════════════════════════════════════════════

        private void BuildUI()
        {
            // Main layout
            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });  // Header
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });  // Controls
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) }); // Slave accounts grid
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(200) }); // Log

            // ── Row 0: Header ──
            TextBlock header = new TextBlock
            {
                Text       = "AlgoFintech Trade Copier",
                FontSize   = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin     = new Thickness(10, 10, 10, 5)
            };
            Grid.SetRow(header, 0);
            mainGrid.Children.Add(header);

            // ── Row 1: Controls ──
            StackPanel controls = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin      = new Thickness(10, 5, 10, 5)
            };

            // Master Account label + combo
            controls.Children.Add(new TextBlock
            {
                Text              = "Master Account:",
                Foreground        = Brushes.White,
                VerticalAlignment = VerticalAlignment.Center,
                Margin            = new Thickness(0, 0, 8, 0)
            });

            cboMasterAccount = new ComboBox
            {
                Width  = 250,
                Margin = new Thickness(0, 0, 10, 0)
            };
            controls.Children.Add(cboMasterAccount);

            btnRefreshAccounts = new Button
            {
                Content = "↻ Refresh",
                Width   = 70,
                Margin  = new Thickness(0, 0, 20, 0)
            };
            btnRefreshAccounts.Click += (s, e) => RefreshAccountList();
            controls.Children.Add(btnRefreshAccounts);

            btnStart = new Button
            {
                Content    = "▶ START COPYING",
                Width      = 130,
                Background = new SolidColorBrush(Color.FromRgb(40, 167, 69)),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold,
                Margin     = new Thickness(0, 0, 10, 0)
            };
            btnStart.Click += OnStartClick;
            controls.Children.Add(btnStart);

            btnStop = new Button
            {
                Content    = "■ STOP",
                Width      = 80,
                Background = new SolidColorBrush(Color.FromRgb(220, 53, 69)),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold,
                IsEnabled  = false,
                Margin     = new Thickness(0, 0, 20, 0)
            };
            btnStop.Click += OnStopClick;
            controls.Children.Add(btnStop);

            lblStatus = new TextBlock
            {
                Text              = "⬤ Stopped",
                Foreground        = Brushes.Gray,
                VerticalAlignment = VerticalAlignment.Center,
                FontWeight        = FontWeights.Bold
            };
            controls.Children.Add(lblStatus);

            Grid.SetRow(controls, 1);
            mainGrid.Children.Add(controls);

            // ── Row 2: Slave Accounts DataGrid ──
            dgSlaveAccounts = new DataGrid
            {
                AutoGenerateColumns = false,
                CanUserAddRows      = false,
                Margin              = new Thickness(10, 5, 10, 5),
                Background          = new SolidColorBrush(Color.FromRgb(30, 33, 40)),
                Foreground          = Brushes.White,
                RowBackground       = new SolidColorBrush(Color.FromRgb(30, 33, 40)),
                AlternatingRowBackground = new SolidColorBrush(Color.FromRgb(38, 41, 50)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HorizontalGridLinesBrush = new SolidColorBrush(Color.FromRgb(60, 63, 70))
            };

            // Columns
            dgSlaveAccounts.Columns.Add(new DataGridCheckBoxColumn
            {
                Header  = "Active",
                Binding = new Binding("IsActive") { Mode = BindingMode.TwoWay, UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged },
                Width   = 60
            });
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header  = "Account Name",
                Binding = new Binding("AccountName"),
                Width   = 200
            });
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header  = "Contracts",
                Binding = new Binding("ContractSize") { Mode = BindingMode.TwoWay, UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged },
                Width   = 80
            });
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header    = "Status",
                Binding   = new Binding("Status"),
                Width     = 100,
                IsReadOnly = true
            });
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header    = "Last Trade",
                Binding   = new Binding("LastTrade"),
                Width     = 200,
                IsReadOnly = true
            });
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header    = "Trades Copied",
                Binding   = new Binding("TradesCopied"),
                Width     = 100,
                IsReadOnly = true
            });

            Grid.SetRow(dgSlaveAccounts, 2);
            mainGrid.Children.Add(dgSlaveAccounts);

            // ── Row 3: Log ──
            txtLog = new TextBox
            {
                IsReadOnly     = true,
                TextWrapping   = TextWrapping.Wrap,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                Background     = new SolidColorBrush(Color.FromRgb(20, 22, 28)),
                Foreground     = new SolidColorBrush(Color.FromRgb(180, 180, 180)),
                FontFamily     = new FontFamily("Consolas"),
                FontSize       = 11,
                Margin         = new Thickness(10, 5, 10, 10)
            };
            Grid.SetRow(txtLog, 3);
            mainGrid.Children.Add(txtLog);

            Content = mainGrid;
        }

        // ═══════════════════════════════════════════════════════════
        // ACCOUNT MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        private void RefreshAccountList()
        {
            try
            {
                cboMasterAccount.Items.Clear();
                var slaveList = new ObservableCollection<SlaveAccountInfo>();

                // Account.All gives us ALL connected accounts in NinjaTrader
                foreach (Account acct in Account.All)
                {
                    // Add to master dropdown
                    cboMasterAccount.Items.Add(acct.Name);

                    // Add to slave grid (user will pick which is master vs slave)
                    var existing = config.SlaveAccounts.FirstOrDefault(s => s.AccountName == acct.Name);
                    slaveList.Add(new SlaveAccountInfo
                    {
                        AccountName  = acct.Name,
                        IsActive     = existing?.IsActive ?? false,
                        ContractSize = existing?.ContractSize ?? 1,
                        Status       = acct.Connection?.Status.ToString() ?? "Unknown",
                        LastTrade    = existing?.LastTrade ?? "",
                        TradesCopied = existing?.TradesCopied ?? 0
                    });
                }

                dgSlaveAccounts.ItemsSource = slaveList;

                // Pre-select master account from config
                if (!string.IsNullOrEmpty(config.MasterAccountName) &&
                    cboMasterAccount.Items.Contains(config.MasterAccountName))
                {
                    cboMasterAccount.SelectedItem = config.MasterAccountName;
                }

                Log($"Found {Account.All.Count} connected accounts");
            }
            catch (Exception ex)
            {
                Log("Error refreshing accounts: " + ex.Message);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // START / STOP COPIER
        // ═══════════════════════════════════════════════════════════

        private void OnStartClick(object sender, RoutedEventArgs e)
        {
            if (cboMasterAccount.SelectedItem == null)
            {
                MessageBox.Show("Please select a master account first.", "AlgoFintech Copier");
                return;
            }

            string masterName = cboMasterAccount.SelectedItem.ToString();

            // Save active slaves to config
            var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
            if (slaveList != null)
            {
                config.SlaveAccounts = slaveList.ToList();
            }

            int activeSlaves = config.SlaveAccounts.Count(s => s.IsActive && s.AccountName != masterName);
            if (activeSlaves == 0)
            {
                MessageBox.Show("No active slave accounts selected.\nCheck the 'Active' box on accounts you want to copy trades to.",
                    "AlgoFintech Copier");
                return;
            }

            config.MasterAccountName = masterName;
            SaveConfig();

            StartCopier();
        }

        private void OnStopClick(object sender, RoutedEventArgs e)
        {
            StopCopier();
        }

        private void StartCopier()
        {
            try
            {
                // Find the master account object
                masterAccount = Account.All.FirstOrDefault(a => a.Name == config.MasterAccountName);
                if (masterAccount == null)
                {
                    Log("ERROR: Master account not found: " + config.MasterAccountName);
                    return;
                }

                // Subscribe to execution updates on the master account
                masterAccount.ExecutionUpdate += OnMasterExecutionUpdate;
                masterAccount.OrderUpdate     += OnMasterOrderUpdate;

                isRunning = true;
                processedExecutionIds.Clear();

                // Update UI
                btnStart.IsEnabled           = false;
                btnStop.IsEnabled            = true;
                cboMasterAccount.IsEnabled   = false;
                btnRefreshAccounts.IsEnabled = false;
                lblStatus.Text               = "⬤ RUNNING";
                lblStatus.Foreground         = new SolidColorBrush(Color.FromRgb(40, 167, 69));

                int activeSlaves = config.SlaveAccounts.Count(s => s.IsActive && s.AccountName != config.MasterAccountName);
                Log($"═══ COPIER STARTED ═══");
                Log($"  Master: {config.MasterAccountName}");
                Log($"  Active Slaves: {activeSlaves}");
                Log($"  Listening for trades on master account...");
            }
            catch (Exception ex)
            {
                Log("ERROR starting copier: " + ex.Message);
            }
        }

        private void StopCopier()
        {
            try
            {
                if (masterAccount != null)
                {
                    masterAccount.ExecutionUpdate -= OnMasterExecutionUpdate;
                    masterAccount.OrderUpdate     -= OnMasterOrderUpdate;
                    masterAccount = null;
                }

                isRunning = false;

                // Update UI on dispatcher thread
                Dispatcher.InvokeAsync(() =>
                {
                    btnStart.IsEnabled           = true;
                    btnStop.IsEnabled            = false;
                    cboMasterAccount.IsEnabled   = true;
                    btnRefreshAccounts.IsEnabled = true;
                    lblStatus.Text               = "⬤ Stopped";
                    lblStatus.Foreground         = Brushes.Gray;
                });

                Log("═══ COPIER STOPPED ═══");
            }
            catch (Exception ex)
            {
                Log("ERROR stopping copier: " + ex.Message);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // CORE COPY LOGIC — Execution Handler
        // ═══════════════════════════════════════════════════════════

        private void OnMasterExecutionUpdate(object sender, ExecutionEventArgs e)
        {
            if (!isRunning) return;

            try
            {
                Execution exec  = e.Execution;
                Order     order = exec.Order;

                // Deduplicate — only process each execution once
                string execId = exec.ExecutionId;
                lock (lockObj)
                {
                    if (processedExecutionIds.Contains(execId)) return;
                    processedExecutionIds.Add(execId);
                }

                // Extract trade details
                string     instrument     = order.Instrument.FullName;
                OrderAction action        = order.OrderAction;
                int         masterQty     = exec.Quantity;
                double      fillPrice     = exec.Price;
                DateTime    fillTime      = exec.Time;
                MarketPosition position   = exec.MarketPosition;

                Log($"──── MASTER FILL DETECTED ────");
                Log($"  Instrument: {instrument}");
                Log($"  Action:     {action} ({position})");
                Log($"  Quantity:   {masterQty}");
                Log($"  Price:      {fillPrice}");
                Log($"  Time:       {fillTime:HH:mm:ss.fff}");

                // Copy to each active slave
                foreach (var slave in config.SlaveAccounts)
                {
                    if (!slave.IsActive) continue;
                    if (slave.AccountName == config.MasterAccountName) continue;

                    CopyTradeToSlave(slave, order.Instrument, action, slave.ContractSize, instrument, fillPrice, fillTime);
                }

                // Log to API (non-blocking)
                Task.Run(() => LogTradeToApi(new TradeEvent
                {
                    MasterAccount = config.MasterAccountName,
                    Instrument    = instrument,
                    Action        = action.ToString(),
                    Quantity      = masterQty,
                    FillPrice     = fillPrice,
                    FillTime      = fillTime,
                    ExecutionId   = execId
                }));
            }
            catch (Exception ex)
            {
                Log("ERROR in ExecutionUpdate: " + ex.Message);
            }
        }

        private void OnMasterOrderUpdate(object sender, OrderEventArgs e)
        {
            // Log order state changes for debugging
            if (!isRunning) return;

            if (e.OrderState == OrderState.Submitted ||
                e.OrderState == OrderState.Rejected ||
                e.OrderState == OrderState.Cancelled)
            {
                Log($"  [Master Order] {e.Order.Name} → {e.OrderState} | {e.Order.Instrument.FullName} {e.Order.OrderAction} x{e.Order.Quantity}");
            }
        }

        // ═══════════════════════════════════════════════════════════
        // COPY A SINGLE TRADE TO A SLAVE ACCOUNT
        // ═══════════════════════════════════════════════════════════

        private void CopyTradeToSlave(SlaveAccountInfo slave, Instrument instrument,
            OrderAction action, int quantity, string instrumentName,
            double masterPrice, DateTime masterTime)
        {
            try
            {
                // Find the slave account object
                Account slaveAcct = Account.All.FirstOrDefault(a => a.Name == slave.AccountName);
                if (slaveAcct == null)
                {
                    Log($"  ✗ Slave '{slave.AccountName}' not found / not connected");
                    slave.Status = "Disconnected";
                    return;
                }

                // Create a market order on the slave account
                // Using "Entry" as name is required to avoid Initialize state issues
                Order slaveOrder = slaveAcct.CreateOrder(
                    instrument,          // Same instrument as master
                    action,              // Buy/Sell — same direction as master
                    OrderType.Market,    // Market order for immediate fill
                    OrderEntry.Automated,
                    TimeInForce.Day,
                    quantity,            // Configurable per slave
                    0,                   // limitPrice (not used for market)
                    0,                   // stopPrice (not used for market)
                    string.Empty,        // OCO id
                    "Entry",             // MUST be "Entry" to avoid stuck orders
                    Core.Globals.MaxDate,
                    null                 // custom order
                );

                // Submit the order
                slaveAcct.Submit(new[] { slaveOrder });

                // Update slave tracking
                slave.TradesCopied++;
                slave.LastTrade = $"{action} {quantity}x {instrumentName} @ {masterPrice:F2}";
                slave.Status    = "Active";

                Log($"  ✓ → {slave.AccountName}: {action} {quantity}x {instrumentName} (market order submitted)");

                // Refresh the grid on UI thread
                Dispatcher.InvokeAsync(() =>
                {
                    dgSlaveAccounts.Items.Refresh();
                });
            }
            catch (Exception ex)
            {
                Log($"  ✗ ERROR copying to {slave.AccountName}: {ex.Message}");
                slave.Status = "Error: " + ex.Message;
            }
        }

        // ═══════════════════════════════════════════════════════════
        // API LOGGING (optional — sends trade events to AlgoFintech)
        // ═══════════════════════════════════════════════════════════

        private static readonly HttpClient httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };

        private async Task LogTradeToApi(TradeEvent tradeEvent)
        {
            try
            {
                string json    = JsonConvert.SerializeObject(tradeEvent);
                var    content = new StringContent(json, Encoding.UTF8, "application/json");
                var    res     = await httpClient.PostAsync(apiBaseUrl + "/api/trade-events", content);

                if (!res.IsSuccessStatusCode)
                    Log($"  [API] Warning: {res.StatusCode}");
            }
            catch
            {
                // API logging is optional — don't disrupt copying if API is down
            }
        }

        // ═══════════════════════════════════════════════════════════
        // LOGGING
        // ═══════════════════════════════════════════════════════════

        private void Log(string message)
        {
            string line = $"[{DateTime.Now:HH:mm:ss}] {message}";

            // Write to file
            try
            {
                File.AppendAllText(LogFile, line + Environment.NewLine);
            }
            catch { }

            // Write to NinjaTrader output
            NinjaTrader.Code.Output.Process(line, PrintTo.OutputTab1);

            // Write to UI log (must be on UI thread)
            Dispatcher.InvokeAsync(() =>
            {
                if (txtLog != null)
                {
                    txtLog.AppendText(line + Environment.NewLine);
                    txtLog.ScrollToEnd();
                }
            });
        }

        // ═══════════════════════════════════════════════════════════
        // CLEANUP
        // ═══════════════════════════════════════════════════════════

        public override string ToString()
        {
            return "AlgoFintech Copier";
        }

        // Called when tab is being destroyed
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                StopCopier();

                // Save final state
                var slaveList = dgSlaveAccounts?.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                if (slaveList != null)
                {
                    config.SlaveAccounts = slaveList.ToList();
                    SaveConfig();
                }
            }
            base.Dispose(disposing);
        }

        // Required NTTabPage overrides
        protected override string GetHeaderPart(string variable)
        {
            return "AlgoFintech Copier";
        }

        protected override void Restore(XElement element)
        {
            // Restore state from workspace
        }

        protected override void Save(XElement element)
        {
            // Save state to workspace
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DATA MODELS
    // ═══════════════════════════════════════════════════════════════

    public class CopierConfig
    {
        public string MasterAccountName { get; set; } = "";
        public string ApiBaseUrl        { get; set; } = "http://localhost:3002";
        public List<SlaveAccountInfo> SlaveAccounts { get; set; } = new List<SlaveAccountInfo>();
    }

    public class SlaveAccountInfo : INotifyPropertyChanged
    {
        private bool   _isActive;
        private string _accountName;
        private int    _contractSize;
        private string _status;
        private string _lastTrade;
        private int    _tradesCopied;

        public bool IsActive
        {
            get => _isActive;
            set { _isActive = value; OnPropertyChanged(nameof(IsActive)); }
        }

        public string AccountName
        {
            get => _accountName;
            set { _accountName = value; OnPropertyChanged(nameof(AccountName)); }
        }

        public int ContractSize
        {
            get => _contractSize;
            set { _contractSize = value; OnPropertyChanged(nameof(ContractSize)); }
        }

        public string Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(nameof(Status)); }
        }

        public string LastTrade
        {
            get => _lastTrade;
            set { _lastTrade = value; OnPropertyChanged(nameof(LastTrade)); }
        }

        public int TradesCopied
        {
            get => _tradesCopied;
            set { _tradesCopied = value; OnPropertyChanged(nameof(TradesCopied)); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string name)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }

    public class TradeEvent
    {
        public string   MasterAccount { get; set; }
        public string   Instrument    { get; set; }
        public string   Action        { get; set; }
        public int      Quantity      { get; set; }
        public double   FillPrice     { get; set; }
        public DateTime FillTime      { get; set; }
        public string   ExecutionId   { get; set; }
    }
}

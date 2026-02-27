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
        // MANUAL JSON HELPERS (no Newtonsoft dependency)
        // ═══════════════════════════════════════════════════════════

        private static string EscapeJson(string s)
        {
            if (s == null) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
        }

        private static string SerializeConfig(CopierConfig cfg)
        {
            var sb = new StringBuilder();
            sb.AppendLine("{");
            sb.AppendLine("  \"MasterAccountName\": \"" + EscapeJson(cfg.MasterAccountName) + "\",");
            sb.AppendLine("  \"ApiBaseUrl\": \"" + EscapeJson(cfg.ApiBaseUrl) + "\",");
            sb.AppendLine("  \"SlaveAccounts\": [");
            for (int i = 0; i < cfg.SlaveAccounts.Count; i++)
            {
                var s = cfg.SlaveAccounts[i];
                sb.Append("    { ");
                sb.Append("\"AccountName\": \"" + EscapeJson(s.AccountName) + "\", ");
                sb.Append("\"IsActive\": " + (s.IsActive ? "true" : "false") + ", ");
                sb.Append("\"ContractSize\": " + s.ContractSize + ", ");
                sb.Append("\"Status\": \"" + EscapeJson(s.Status ?? "") + "\", ");
                sb.Append("\"LastTrade\": \"" + EscapeJson(s.LastTrade ?? "") + "\", ");
                sb.Append("\"TradesCopied\": " + s.TradesCopied);
                sb.Append(" }");
                if (i < cfg.SlaveAccounts.Count - 1) sb.Append(",");
                sb.AppendLine();
            }
            sb.AppendLine("  ]");
            sb.AppendLine("}");
            return sb.ToString();
        }

        private static CopierConfig DeserializeConfig(string json)
        {
            var cfg = new CopierConfig();
            try
            {
                // Parse MasterAccountName
                cfg.MasterAccountName = ExtractStringValue(json, "MasterAccountName") ?? "";
                cfg.ApiBaseUrl = ExtractStringValue(json, "ApiBaseUrl") ?? "http://localhost:3002";

                // Parse SlaveAccounts array
                int arrStart = json.IndexOf("\"SlaveAccounts\"");
                if (arrStart >= 0)
                {
                    int bracketStart = json.IndexOf('[', arrStart);
                    int bracketEnd = json.LastIndexOf(']');
                    if (bracketStart >= 0 && bracketEnd > bracketStart)
                    {
                        string arrContent = json.Substring(bracketStart + 1, bracketEnd - bracketStart - 1);
                        // Split by "}" to find each object
                        int searchFrom = 0;
                        while (true)
                        {
                            int objStart = arrContent.IndexOf('{', searchFrom);
                            int objEnd = arrContent.IndexOf('}', objStart >= 0 ? objStart : 0);
                            if (objStart < 0 || objEnd < 0) break;

                            string objStr = arrContent.Substring(objStart, objEnd - objStart + 1);
                            var slave = new SlaveAccountInfo
                            {
                                AccountName  = ExtractStringValue(objStr, "AccountName") ?? "",
                                IsActive     = ExtractBoolValue(objStr, "IsActive"),
                                ContractSize = ExtractIntValue(objStr, "ContractSize", 1),
                                Status       = ExtractStringValue(objStr, "Status") ?? "",
                                LastTrade    = ExtractStringValue(objStr, "LastTrade") ?? "",
                                TradesCopied = ExtractIntValue(objStr, "TradesCopied", 0)
                            };
                            if (!string.IsNullOrEmpty(slave.AccountName))
                                cfg.SlaveAccounts.Add(slave);

                            searchFrom = objEnd + 1;
                        }
                    }
                }
            }
            catch { }
            return cfg;
        }

        private static string ExtractStringValue(string json, string key)
        {
            string search = "\"" + key + "\"";
            int idx = json.IndexOf(search);
            if (idx < 0) return null;
            int colonIdx = json.IndexOf(':', idx + search.Length);
            if (colonIdx < 0) return null;
            int quoteStart = json.IndexOf('"', colonIdx + 1);
            if (quoteStart < 0) return null;
            int quoteEnd = json.IndexOf('"', quoteStart + 1);
            if (quoteEnd < 0) return null;
            return json.Substring(quoteStart + 1, quoteEnd - quoteStart - 1)
                .Replace("\\\\", "\\").Replace("\\\"", "\"").Replace("\\n", "\n").Replace("\\r", "\r").Replace("\\t", "\t");
        }

        private static bool ExtractBoolValue(string json, string key)
        {
            string search = "\"" + key + "\"";
            int idx = json.IndexOf(search);
            if (idx < 0) return false;
            int colonIdx = json.IndexOf(':', idx + search.Length);
            if (colonIdx < 0) return false;
            string rest = json.Substring(colonIdx + 1).TrimStart();
            return rest.StartsWith("true", StringComparison.OrdinalIgnoreCase);
        }

        private static int ExtractIntValue(string json, string key, int defaultVal)
        {
            string search = "\"" + key + "\"";
            int idx = json.IndexOf(search);
            if (idx < 0) return defaultVal;
            int colonIdx = json.IndexOf(':', idx + search.Length);
            if (colonIdx < 0) return defaultVal;
            string rest = json.Substring(colonIdx + 1).TrimStart();
            string numStr = "";
            foreach (char c in rest)
            {
                if (char.IsDigit(c) || c == '-') numStr += c;
                else if (numStr.Length > 0) break;
            }
            int result;
            return int.TryParse(numStr, out result) ? result : defaultVal;
        }

        private static string SerializeTradeEvent(TradeEvent te)
        {
            var sb = new StringBuilder();
            sb.Append("{");
            sb.Append("\"MasterAccount\":\"" + EscapeJson(te.MasterAccount) + "\",");
            sb.Append("\"Instrument\":\"" + EscapeJson(te.Instrument) + "\",");
            sb.Append("\"Action\":\"" + EscapeJson(te.Action) + "\",");
            sb.Append("\"Quantity\":" + te.Quantity + ",");
            sb.Append("\"FillPrice\":" + te.FillPrice.ToString("F6", System.Globalization.CultureInfo.InvariantCulture) + ",");
            sb.Append("\"FillTime\":\"" + te.FillTime.ToString("o") + "\",");
            sb.Append("\"ExecutionId\":\"" + EscapeJson(te.ExecutionId) + "\"");
            sb.Append("}");
            return sb.ToString();
        }

        private static string SerializeSyncPayload(string masterName, List<SlaveAccountInfo> slaves, bool running)
        {
            var sb = new StringBuilder();
            sb.Append("{");
            sb.Append("\"MasterAccount\":\"" + EscapeJson(masterName) + "\",");
            sb.Append("\"IsRunning\":" + (running ? "true" : "false") + ",");
            sb.Append("\"SlaveAccounts\":[");
            for (int i = 0; i < slaves.Count; i++)
            {
                var s = slaves[i];
                if (s.AccountName == masterName) continue;
                sb.Append("{");
                sb.Append("\"AccountName\":\"" + EscapeJson(s.AccountName) + "\",");
                sb.Append("\"IsActive\":" + (s.IsActive ? "true" : "false") + ",");
                sb.Append("\"ContractSize\":" + s.ContractSize + ",");
                sb.Append("\"TradesCopied\":" + s.TradesCopied + ",");
                sb.Append("\"LastTrade\":\"" + EscapeJson(s.LastTrade ?? "") + "\"");
                sb.Append("}");
                if (i < slaves.Count - 1) sb.Append(",");
            }
            sb.Append("]}");
            return sb.ToString();
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
                    config = DeserializeConfig(json);
                    if (!string.IsNullOrEmpty(config.ApiBaseUrl))
                        apiBaseUrl = config.ApiBaseUrl;
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
                string json = SerializeConfig(config);
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
                Content = "Refresh",
                Width   = 70,
                Margin  = new Thickness(0, 0, 20, 0)
            };
            btnRefreshAccounts.Click += (s, e) => RefreshAccountList();
            controls.Children.Add(btnRefreshAccounts);

            btnStart = new Button
            {
                Content    = "START COPYING",
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
                Content    = "STOP",
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
                Text              = "Stopped",
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
                        IsActive     = existing != null ? existing.IsActive : false,
                        ContractSize = existing != null ? existing.ContractSize : 1,
                        Status       = acct.Connection != null ? acct.Connection.Status.ToString() : "Unknown",
                        LastTrade    = existing != null ? (existing.LastTrade ?? "") : "",
                        TradesCopied = existing != null ? existing.TradesCopied : 0
                    });
                }

                dgSlaveAccounts.ItemsSource = slaveList;

                // Pre-select master account from config
                if (!string.IsNullOrEmpty(config.MasterAccountName) &&
                    cboMasterAccount.Items.Contains(config.MasterAccountName))
                {
                    cboMasterAccount.SelectedItem = config.MasterAccountName;
                }

                Log("Found " + Account.All.Count + " connected accounts");
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
                lblStatus.Text               = "RUNNING";
                lblStatus.Foreground         = new SolidColorBrush(Color.FromRgb(40, 167, 69));

                int activeSlaves = config.SlaveAccounts.Count(s => s.IsActive && s.AccountName != config.MasterAccountName);
                Log("=== COPIER STARTED ===");
                Log("  Master: " + config.MasterAccountName);
                Log("  Active Slaves: " + activeSlaves);
                Log("  Listening for trades on master account...");

                // Sync accounts to dashboard via API
                Task.Run(() => SyncAccountsToApi(true));
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
                    lblStatus.Text               = "Stopped";
                    lblStatus.Foreground         = Brushes.Gray;
                });

                Log("=== COPIER STOPPED ===");

                // Sync disconnected state to dashboard
                Task.Run(() => SyncAccountsToApi(false));
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

                Log("---- MASTER FILL DETECTED ----");
                Log("  Instrument: " + instrument);
                Log("  Action:     " + action + " (" + position + ")");
                Log("  Quantity:   " + masterQty);
                Log("  Price:      " + fillPrice);
                Log("  Time:       " + fillTime.ToString("HH:mm:ss.fff"));

                // Copy to each active slave
                foreach (var slave in config.SlaveAccounts)
                {
                    if (!slave.IsActive) continue;
                    if (slave.AccountName == config.MasterAccountName) continue;

                    CopyTradeToSlave(slave, order.Instrument, action, slave.ContractSize, instrument, fillPrice, fillTime);
                }

                // Log to API and sync updated account state (non-blocking)
                Task.Run(async () =>
                {
                    await LogTradeToApi(new TradeEvent
                    {
                        MasterAccount = config.MasterAccountName,
                        Instrument    = instrument,
                        Action        = action.ToString(),
                        Quantity      = masterQty,
                        FillPrice     = fillPrice,
                        FillTime      = fillTime,
                        ExecutionId   = execId
                    });
                    // Also sync account state so dashboard sees updated trade counts
                    await SyncAccountsToApi(true);
                });
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
                Log("  [Master Order] " + e.Order.Name + " > " + e.OrderState + " | " + e.Order.Instrument.FullName + " " + e.Order.OrderAction + " x" + e.Order.Quantity);
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
                    Log("  X Slave '" + slave.AccountName + "' not found / not connected");
                    slave.Status = "Disconnected";
                    return;
                }

                // Create a market order on the slave account
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
                slave.LastTrade = action + " " + quantity + "x " + instrumentName + " @ " + masterPrice.ToString("F2");
                slave.Status    = "Active";

                Log("  OK > " + slave.AccountName + ": " + action + " " + quantity + "x " + instrumentName + " (market order submitted)");

                // Refresh the grid on UI thread
                Dispatcher.InvokeAsync(() =>
                {
                    dgSlaveAccounts.Items.Refresh();
                });
            }
            catch (Exception ex)
            {
                Log("  X ERROR copying to " + slave.AccountName + ": " + ex.Message);
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
                string json    = SerializeTradeEvent(tradeEvent);
                var    content = new StringContent(json, Encoding.UTF8, "application/json");
                var    res     = await httpClient.PostAsync(apiBaseUrl + "/api/trade-events", content);

                if (!res.IsSuccessStatusCode)
                    Log("  [API] Warning: " + res.StatusCode);
            }
            catch
            {
                // API logging is optional — don't disrupt copying if API is down
            }
        }

        // Sync account state to API -> Supabase -> Dashboard
        private async Task SyncAccountsToApi(bool running)
        {
            try
            {
                var slaves = config.SlaveAccounts;
                string json = SerializeSyncPayload(config.MasterAccountName, slaves, running);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var res = await httpClient.PostAsync(apiBaseUrl + "/api/sync-accounts", content);

                if (res.IsSuccessStatusCode)
                    Log("[API] Account sync OK (" + (running ? "running" : "stopped") + ")");
                else
                    Log("[API] Account sync warning: " + res.StatusCode);
            }
            catch (Exception ex)
            {
                Log("[API] Account sync failed (API may be offline): " + ex.Message);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // LOGGING
        // ═══════════════════════════════════════════════════════════

        private void Log(string message)
        {
            string line = "[" + DateTime.Now.ToString("HH:mm:ss") + "] " + message;

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

        // Cleanup when tab is destroyed — use Cleanup instead of Dispose
        public void Cleanup()
        {
            StopCopier();

            // Save final state
            var slaveList = dgSlaveAccounts != null ? dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo> : null;
            if (slaveList != null)
            {
                config.SlaveAccounts = slaveList.ToList();
                SaveConfig();
            }
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
            // Save state to workspace — also use this to cleanup
            Cleanup();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DATA MODELS
    // ═══════════════════════════════════════════════════════════════

    public class CopierConfig
    {
        public string MasterAccountName { get; set; }
        public string ApiBaseUrl        { get; set; }
        public List<SlaveAccountInfo> SlaveAccounts { get; set; }

        public CopierConfig()
        {
            MasterAccountName = "";
            ApiBaseUrl = "http://localhost:3002";
            SlaveAccounts = new List<SlaveAccountInfo>();
        }
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
            get { return _isActive; }
            set { _isActive = value; OnPropertyChanged("IsActive"); }
        }

        public string AccountName
        {
            get { return _accountName; }
            set { _accountName = value; OnPropertyChanged("AccountName"); }
        }

        public int ContractSize
        {
            get { return _contractSize; }
            set { _contractSize = value; OnPropertyChanged("ContractSize"); }
        }

        public string Status
        {
            get { return _status; }
            set { _status = value; OnPropertyChanged("Status"); }
        }

        public string LastTrade
        {
            get { return _lastTrade; }
            set { _lastTrade = value; OnPropertyChanged("LastTrade"); }
        }

        public int TradesCopied
        {
            get { return _tradesCopied; }
            set { _tradesCopied = value; OnPropertyChanged("TradesCopied"); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string name)
        {
            if (PropertyChanged != null)
                PropertyChanged(this, new PropertyChangedEventArgs(name));
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

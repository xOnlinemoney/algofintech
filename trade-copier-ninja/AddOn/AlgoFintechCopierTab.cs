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

        // ─── Bidirectional Sync ────────────────────────────────
        private System.Threading.Timer changeCheckTimer;
        private System.Threading.Timer liveDataTimer;
        private bool isSyncing = false;
        private string lastKnownChangeTime = "";
        private bool suppressLocalPush = false;

        // ─── Client Name Cache ─────────────────────────────────
        private Dictionary<string, string> clientNameCache = new Dictionary<string, string>();

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
                cfg.MasterAccountName = ExtractStringValue(json, "MasterAccountName") ?? "";
                cfg.ApiBaseUrl = ExtractStringValue(json, "ApiBaseUrl") ?? "http://localhost:3002";

                int arrStart = json.IndexOf("\"SlaveAccounts\"");
                if (arrStart >= 0)
                {
                    int bracketStart = json.IndexOf('[', arrStart);
                    int bracketEnd = json.LastIndexOf(']');
                    if (bracketStart >= 0 && bracketEnd > bracketStart)
                    {
                        string arrContent = json.Substring(bracketStart + 1, bracketEnd - bracketStart - 1);
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

        private static double ExtractDoubleValue(string json, string key, double defaultVal)
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
                if (char.IsDigit(c) || c == '-' || c == '.') numStr += c;
                else if (numStr.Length > 0) break;
            }
            double result;
            return double.TryParse(numStr, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out result) ? result : defaultVal;
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
                sb.Append("\"LastTrade\":\"" + EscapeJson(s.LastTrade ?? "") + "\",");
                sb.Append("\"Unrealized\":" + s.Unrealized.ToString("F2", System.Globalization.CultureInfo.InvariantCulture) + ",");
                sb.Append("\"Realized\":" + s.Realized.ToString("F2", System.Globalization.CultureInfo.InvariantCulture) + ",");
                sb.Append("\"NetLiquidation\":" + s.NetLiquidation.ToString("F2", System.Globalization.CultureInfo.InvariantCulture) + ",");
                sb.Append("\"PositionQty\":" + s.Position + ",");
                sb.Append("\"TotalPnl\":" + s.TotalPnl.ToString("F2", System.Globalization.CultureInfo.InvariantCulture));
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
        // UI CONSTRUCTION
        // Matches NinjaTrader Account Performance layout:
        //   Active | Account | Client Name | Size | Pos | Unrealized |
        //   Realized | Net Liquidation | Qty | Total PNL | Status
        // ═══════════════════════════════════════════════════════════

        private void BuildUI()
        {
            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });  // Header
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });  // Controls
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) }); // Account grid
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(180) }); // Log

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

            // ── Row 2: Accounts DataGrid (matches NinjaTrader style) ──
            dgSlaveAccounts = new DataGrid
            {
                AutoGenerateColumns      = false,
                CanUserAddRows           = false,
                Margin                   = new Thickness(10, 5, 10, 5),
                Background               = new SolidColorBrush(Color.FromRgb(230, 235, 245)),
                Foreground               = Brushes.Black,
                RowBackground            = new SolidColorBrush(Color.FromRgb(245, 248, 255)),
                AlternatingRowBackground = new SolidColorBrush(Color.FromRgb(230, 235, 248)),
                GridLinesVisibility      = DataGridGridLinesVisibility.All,
                HorizontalGridLinesBrush = new SolidColorBrush(Color.FromRgb(200, 205, 215)),
                VerticalGridLinesBrush   = new SolidColorBrush(Color.FromRgb(200, 205, 215)),
                HeadersVisibility        = DataGridHeadersVisibility.Column,
                RowHeaderWidth           = 0,
                BorderBrush              = new SolidColorBrush(Color.FromRgb(180, 185, 195)),
                BorderThickness          = new Thickness(1),
                FontSize                 = 12,
                FontFamily               = new FontFamily("Segoe UI"),
                SelectionMode            = DataGridSelectionMode.Single,
                SelectionUnit            = DataGridSelectionUnit.FullRow
            };

            // ─ Column: Active checkbox ─
            dgSlaveAccounts.Columns.Add(new DataGridCheckBoxColumn
            {
                Header  = "Active",
                Binding = new Binding("IsActive") { Mode = BindingMode.TwoWay, UpdateSourceTrigger = UpdateSourceTrigger.PropertyChanged },
                Width   = 50
            });

            // ─ Column: Account Name ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Account",
                Binding    = new Binding("AccountName"),
                Width      = 220,
                IsReadOnly = true
            });

            // ─ Column: Client Name (from Supabase) ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Client Name",
                Binding    = new Binding("ClientName"),
                Width      = 150,
                IsReadOnly = true
            });

            // ─ Column: Size (contract multiplier) ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header  = "Size",
                Binding = new Binding("ContractSizeDisplay"),
                Width   = 50,
                IsReadOnly = true
            });

            // ─ Column: Pos (current position) ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Pos",
                Binding    = new Binding("PositionDisplay"),
                Width      = 50,
                IsReadOnly = true
            });

            // ─ Column: Unrealized PnL ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Unrealized",
                Binding    = new Binding("UnrealizedDisplay"),
                Width      = 100,
                IsReadOnly = true
            });

            // ─ Column: Realized PnL ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Realized",
                Binding    = new Binding("RealizedDisplay"),
                Width      = 100,
                IsReadOnly = true
            });

            // ─ Column: Net Liquidation ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Net Liquidation",
                Binding    = new Binding("NetLiquidationDisplay"),
                Width      = 120,
                IsReadOnly = true
            });

            // ─ Column: Qty (trade count today) ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Qty",
                Binding    = new Binding("TradesCopied"),
                Width      = 45,
                IsReadOnly = true
            });

            // ─ Column: Total PNL ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Total PNL",
                Binding    = new Binding("TotalPnlDisplay"),
                Width      = 100,
                IsReadOnly = true
            });

            // ─ Column: Status ─
            dgSlaveAccounts.Columns.Add(new DataGridTextColumn
            {
                Header     = "Status",
                Binding    = new Binding("Status"),
                Width      = 90,
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

                foreach (Account acct in Account.All)
                {
                    cboMasterAccount.Items.Add(acct.Name);

                    var existing = config.SlaveAccounts.FirstOrDefault(s => s.AccountName == acct.Name);

                    // Read live account data from NinjaTrader
                    double unrealized    = 0;
                    double realized      = 0;
                    double netLiq        = 0;
                    double totalPnl      = 0;

                    try
                    {
                        unrealized = acct.Get(AccountItem.UnrealizedProfitLoss, Currency.UsDollar);
                        realized   = acct.Get(AccountItem.RealizedProfitLoss, Currency.UsDollar);
                        netLiq     = acct.Get(AccountItem.NetLiquidation, Currency.UsDollar);
                        totalPnl   = unrealized + realized;
                    }
                    catch { }

                    // Get position info
                    int posQty = 0;
                    try
                    {
                        foreach (Position pos in acct.Positions)
                        {
                            posQty += pos.Quantity;
                        }
                    }
                    catch { }

                    string clientName = "";
                    if (clientNameCache.ContainsKey(acct.Name))
                        clientName = clientNameCache[acct.Name];

                    slaveList.Add(new SlaveAccountInfo
                    {
                        AccountName    = acct.Name,
                        IsActive       = existing != null ? existing.IsActive : false,
                        ContractSize   = existing != null ? existing.ContractSize : 1,
                        Status         = acct.Connection != null ? acct.Connection.Status.ToString() : "Unknown",
                        LastTrade      = existing != null ? (existing.LastTrade ?? "") : "",
                        TradesCopied   = existing != null ? existing.TradesCopied : 0,
                        ClientName     = clientName,
                        Unrealized     = unrealized,
                        Realized       = realized,
                        NetLiquidation = netLiq,
                        TotalPnl       = totalPnl,
                        Position       = posQty
                    });
                }

                // Subscribe to property changes on each slave for instant push
                foreach (var slave in slaveList)
                {
                    slave.PropertyChanged += OnSlavePropertyChanged;
                }

                dgSlaveAccounts.ItemsSource = slaveList;

                // Pre-select master account from config
                if (!string.IsNullOrEmpty(config.MasterAccountName) &&
                    cboMasterAccount.Items.Contains(config.MasterAccountName))
                {
                    cboMasterAccount.SelectedItem = config.MasterAccountName;
                }

                Log("Found " + Account.All.Count + " connected accounts");

                // Fetch client names from API in background
                Task.Run(() => FetchClientNames());
            }
            catch (Exception ex)
            {
                Log("Error refreshing accounts: " + ex.Message);
            }
        }

        // ─── Fetch client names from Supabase via API ─────────────
        private async Task FetchClientNames()
        {
            try
            {
                // Collect all account names
                var accountNames = new List<string>();
                Dispatcher.Invoke(() =>
                {
                    var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                    if (slaveList != null)
                    {
                        foreach (var s in slaveList)
                            accountNames.Add(s.AccountName);
                    }
                });

                if (accountNames.Count == 0) return;

                string accountsParam = string.Join(",", accountNames);
                string url = apiBaseUrl + "/api/client-names?accounts=" + System.Uri.EscapeDataString(accountsParam);

                var res = await httpClient.GetAsync(url);
                if (!res.IsSuccessStatusCode) return;

                string responseJson = await res.Content.ReadAsStringAsync();

                // Parse the clients map: {"clients":{"APEX123":"John Doe","APEX456":"Jane"}}
                int clientsStart = responseJson.IndexOf("\"clients\"");
                if (clientsStart < 0) return;
                int objStart = responseJson.IndexOf('{', clientsStart + 9);
                if (objStart < 0) return;

                // Find the matching closing brace
                int depth = 1;
                int pos = objStart + 1;
                while (pos < responseJson.Length && depth > 0)
                {
                    if (responseJson[pos] == '{') depth++;
                    else if (responseJson[pos] == '}') depth--;
                    pos++;
                }
                string clientsObj = responseJson.Substring(objStart, pos - objStart);

                // Parse key-value pairs from the clients object
                var newCache = new Dictionary<string, string>();
                int searchFrom = 1;
                while (searchFrom < clientsObj.Length)
                {
                    int keyStart = clientsObj.IndexOf('"', searchFrom);
                    if (keyStart < 0) break;
                    int keyEnd = clientsObj.IndexOf('"', keyStart + 1);
                    if (keyEnd < 0) break;
                    string key = clientsObj.Substring(keyStart + 1, keyEnd - keyStart - 1);

                    int valStart = clientsObj.IndexOf('"', keyEnd + 1);
                    if (valStart < 0) break;
                    int valEnd = clientsObj.IndexOf('"', valStart + 1);
                    if (valEnd < 0) break;
                    string val = clientsObj.Substring(valStart + 1, valEnd - valStart - 1);

                    newCache[key] = val;
                    searchFrom = valEnd + 1;
                }

                clientNameCache = newCache;

                // Update the UI with client names
                Dispatcher.InvokeAsync(() =>
                {
                    var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                    if (slaveList != null)
                    {
                        suppressLocalPush = true;
                        foreach (var slave in slaveList)
                        {
                            if (clientNameCache.ContainsKey(slave.AccountName))
                                slave.ClientName = clientNameCache[slave.AccountName];
                        }
                        suppressLocalPush = false;
                    }
                });

                if (newCache.Count > 0)
                    Log("[API] Loaded " + newCache.Count + " client names from Supabase");
            }
            catch (Exception ex)
            {
                Log("[API] Client names fetch failed: " + ex.Message);
            }
        }

        // ─── Instant push when NT checkbox/contract changes ──────
        private void OnSlavePropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!isRunning) return;
            if (suppressLocalPush) return;

            if (e.PropertyName == "IsActive" || e.PropertyName == "ContractSize")
            {
                var slave = sender as SlaveAccountInfo;
                if (slave != null)
                {
                    Log("[Push] " + slave.AccountName + " " + e.PropertyName + " changed -> syncing to dashboard");
                }

                var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                if (slaveList != null)
                {
                    config.SlaveAccounts = slaveList.ToList();
                    SaveConfig();
                }
                Task.Run(() => SyncAccountsToApi(true));
            }
        }

        // ═══════════════════════════════════════════════════════════
        // LIVE DATA REFRESH — Updates PnL, positions every 2s
        // ═══════════════════════════════════════════════════════════

        private void StartLiveDataTimer()
        {
            liveDataTimer = new System.Threading.Timer(
                _ => RefreshLiveData(),
                null,
                TimeSpan.FromSeconds(2),
                TimeSpan.FromSeconds(2)
            );
        }

        private void StopLiveDataTimer()
        {
            if (liveDataTimer != null)
            {
                liveDataTimer.Dispose();
                liveDataTimer = null;
            }
        }

        private void RefreshLiveData()
        {
            try
            {
                Dispatcher.InvokeAsync(() =>
                {
                    var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                    if (slaveList == null) return;

                    suppressLocalPush = true;
                    foreach (var slave in slaveList)
                    {
                        Account acct = Account.All.FirstOrDefault(a => a.Name == slave.AccountName);
                        if (acct == null) continue;

                        try
                        {
                            slave.Unrealized     = acct.Get(AccountItem.UnrealizedProfitLoss, Currency.UsDollar);
                            slave.Realized       = acct.Get(AccountItem.RealizedProfitLoss, Currency.UsDollar);
                            slave.NetLiquidation = acct.Get(AccountItem.NetLiquidation, Currency.UsDollar);
                            slave.TotalPnl       = slave.Unrealized + slave.Realized;

                            int posQty = 0;
                            foreach (Position p in acct.Positions)
                                posQty += p.Quantity;
                            slave.Position = posQty;

                            slave.Status = acct.Connection != null ? acct.Connection.Status.ToString() : "Unknown";
                        }
                        catch { }
                    }
                    suppressLocalPush = false;
                });
            }
            catch { }
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
                masterAccount = Account.All.FirstOrDefault(a => a.Name == config.MasterAccountName);
                if (masterAccount == null)
                {
                    Log("ERROR: Master account not found: " + config.MasterAccountName);
                    return;
                }

                masterAccount.ExecutionUpdate += OnMasterExecutionUpdate;
                masterAccount.OrderUpdate     += OnMasterOrderUpdate;

                isRunning = true;
                processedExecutionIds.Clear();

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

                Task.Run(() => SyncAccountsToApi(true));
                StartPolling();
                StartLiveDataTimer();
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

                Dispatcher.InvokeAsync(() =>
                {
                    btnStart.IsEnabled           = true;
                    btnStop.IsEnabled            = false;
                    cboMasterAccount.IsEnabled   = true;
                    btnRefreshAccounts.IsEnabled = true;
                    lblStatus.Text               = "Stopped";
                    lblStatus.Foreground         = Brushes.Gray;
                });

                StopPolling();
                StopLiveDataTimer();

                Log("=== COPIER STOPPED ===");

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

                string execId = exec.ExecutionId;
                lock (lockObj)
                {
                    if (processedExecutionIds.Contains(execId)) return;
                    processedExecutionIds.Add(execId);
                }

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

                foreach (var slave in config.SlaveAccounts)
                {
                    if (!slave.IsActive) continue;
                    if (slave.AccountName == config.MasterAccountName) continue;

                    CopyTradeToSlave(slave, order.Instrument, action, slave.ContractSize, instrument, fillPrice, fillTime);
                }

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
                Account slaveAcct = Account.All.FirstOrDefault(a => a.Name == slave.AccountName);
                if (slaveAcct == null)
                {
                    Log("  X Slave '" + slave.AccountName + "' not found / not connected");
                    slave.Status = "Disconnected";
                    return;
                }

                Order slaveOrder = slaveAcct.CreateOrder(
                    instrument,
                    action,
                    OrderType.Market,
                    OrderEntry.Automated,
                    TimeInForce.Day,
                    quantity,
                    0, 0,
                    string.Empty,
                    "Entry",
                    Core.Globals.MaxDate,
                    null
                );

                slaveAcct.Submit(new[] { slaveOrder });

                slave.TradesCopied++;
                slave.LastTrade = action + " " + quantity + "x " + instrumentName + " @ " + masterPrice.ToString("F2");
                slave.Status    = "Active";

                Log("  OK > " + slave.AccountName + ": " + action + " " + quantity + "x " + instrumentName + " (market order submitted)");

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
        // API LOGGING
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
            catch { }
        }

        private async Task SyncAccountsToApi(bool running)
        {
            try
            {
                // Get fresh slave list from DataGrid (the live bound objects)
                List<SlaveAccountInfo> slaves = null;
                Dispatcher.Invoke(() =>
                {
                    var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                    if (slaveList != null)
                        slaves = slaveList.ToList();
                });
                if (slaves == null) slaves = config.SlaveAccounts;
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
        // WEBSITE -> NT: Check for dashboard changes
        // ═══════════════════════════════════════════════════════════

        private void StartPolling()
        {
            changeCheckTimer = new System.Threading.Timer(
                _ => Task.Run(() => CheckForDashboardChanges()),
                null,
                TimeSpan.FromSeconds(3),
                TimeSpan.FromSeconds(5)
            );
            Log("[Sync] Listening for dashboard changes...");
        }

        private void StopPolling()
        {
            if (changeCheckTimer != null)
            {
                changeCheckTimer.Dispose();
                changeCheckTimer = null;
            }
        }

        private async Task CheckForDashboardChanges()
        {
            if (!isRunning || isSyncing) return;
            isSyncing = true;

            try
            {
                string url = apiBaseUrl + "/api/check-changes";
                if (!string.IsNullOrEmpty(lastKnownChangeTime))
                    url = url + "?since=" + System.Uri.EscapeDataString(lastKnownChangeTime);
                else
                    url = url + "?since=" + System.Uri.EscapeDataString(DateTime.UtcNow.AddMinutes(-1).ToString("o"));

                var res = await httpClient.GetAsync(url);
                if (!res.IsSuccessStatusCode) { isSyncing = false; return; }

                string responseJson = await res.Content.ReadAsStringAsync();

                bool hasChanges = ExtractBoolValue(responseJson, "hasChanges");
                if (!hasChanges) { isSyncing = false; return; }

                string newChangeTime = ExtractStringValue(responseJson, "latestChange");
                if (!string.IsNullOrEmpty(newChangeTime))
                    lastKnownChangeTime = newChangeTime;

                int dataStart = responseJson.IndexOf("\"accounts\"");
                if (dataStart < 0) { isSyncing = false; return; }
                int arrStart = responseJson.IndexOf('[', dataStart);
                int arrEnd = responseJson.LastIndexOf(']');
                if (arrStart < 0 || arrEnd < 0) { isSyncing = false; return; }

                string arrContent = responseJson.Substring(arrStart + 1, arrEnd - arrStart - 1);

                var remoteAccounts = new List<RemoteAccountState>();
                int searchFrom = 0;
                while (true)
                {
                    int objStart = arrContent.IndexOf('{', searchFrom);
                    int objEnd = arrContent.IndexOf('}', objStart >= 0 ? objStart : 0);
                    if (objStart < 0 || objEnd < 0) break;

                    string objStr = arrContent.Substring(objStart, objEnd - objStart + 1);
                    remoteAccounts.Add(new RemoteAccountState
                    {
                        AccountName  = ExtractStringValue(objStr, "account_name") ?? "",
                        IsMaster     = ExtractBoolValue(objStr, "is_master"),
                        IsActive     = ExtractBoolValue(objStr, "is_active"),
                        ContractSize = ExtractIntValue(objStr, "contract_size", 1)
                    });

                    searchFrom = objEnd + 1;
                }

                // Apply changes on UI thread so we update the actual DataGrid-bound objects
                var remoteCopy = remoteAccounts; // capture for closure
                Dispatcher.InvokeAsync(() =>
                {
                    var slaveList = dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo>;
                    if (slaveList == null) return;

                    bool changed = false;
                    suppressLocalPush = true;
                    foreach (var remote in remoteCopy)
                    {
                        if (remote.IsMaster) continue;
                        if (string.IsNullOrEmpty(remote.AccountName)) continue;

                        // Find in the DATAGRID's bound collection (not config copy)
                        var local = slaveList.FirstOrDefault(s => s.AccountName == remote.AccountName);
                        if (local != null)
                        {
                            if (local.IsActive != remote.IsActive)
                            {
                                Log("[Sync] Dashboard toggled " + remote.AccountName + " active: " + local.IsActive + " -> " + remote.IsActive);
                                local.IsActive = remote.IsActive;
                                changed = true;
                            }
                            if (local.ContractSize != remote.ContractSize)
                            {
                                Log("[Sync] Dashboard changed " + remote.AccountName + " contracts: " + local.ContractSize + " -> " + remote.ContractSize);
                                local.ContractSize = remote.ContractSize;
                                changed = true;
                            }
                        }
                    }
                    suppressLocalPush = false;

                    if (changed)
                    {
                        // Update config from the live DataGrid data
                        config.SlaveAccounts = slaveList.ToList();
                        SaveConfig();
                    }
                });
            }
            catch { }

            isSyncing = false;
        }

        // ═══════════════════════════════════════════════════════════
        // LOGGING
        // ═══════════════════════════════════════════════════════════

        private void Log(string message)
        {
            string line = "[" + DateTime.Now.ToString("HH:mm:ss") + "] " + message;

            try
            {
                File.AppendAllText(LogFile, line + Environment.NewLine);
            }
            catch { }

            NinjaTrader.Code.Output.Process(line, PrintTo.OutputTab1);

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

        public void Cleanup()
        {
            StopPolling();
            StopLiveDataTimer();
            StopCopier();

            var slaveList = dgSlaveAccounts != null ? dgSlaveAccounts.ItemsSource as ObservableCollection<SlaveAccountInfo> : null;
            if (slaveList != null)
            {
                config.SlaveAccounts = slaveList.ToList();
                SaveConfig();
            }
        }

        protected override string GetHeaderPart(string variable)
        {
            return "AlgoFintech Copier";
        }

        protected override void Restore(XElement element)
        {
        }

        protected override void Save(XElement element)
        {
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
        private string _clientName;
        private double _unrealized;
        private double _realized;
        private double _netLiquidation;
        private double _totalPnl;
        private int    _position;

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
            set { _contractSize = value; OnPropertyChanged("ContractSize"); OnPropertyChanged("ContractSizeDisplay"); }
        }

        public string ContractSizeDisplay
        {
            get { return _contractSize + "x"; }
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

        public string ClientName
        {
            get { return _clientName ?? ""; }
            set { _clientName = value; OnPropertyChanged("ClientName"); }
        }

        public double Unrealized
        {
            get { return _unrealized; }
            set { _unrealized = value; OnPropertyChanged("Unrealized"); OnPropertyChanged("UnrealizedDisplay"); }
        }

        public string UnrealizedDisplay
        {
            get { return FormatCurrency(_unrealized); }
        }

        public double Realized
        {
            get { return _realized; }
            set { _realized = value; OnPropertyChanged("Realized"); OnPropertyChanged("RealizedDisplay"); }
        }

        public string RealizedDisplay
        {
            get { return FormatCurrency(_realized); }
        }

        public double NetLiquidation
        {
            get { return _netLiquidation; }
            set { _netLiquidation = value; OnPropertyChanged("NetLiquidation"); OnPropertyChanged("NetLiquidationDisplay"); }
        }

        public string NetLiquidationDisplay
        {
            get { return "$" + _netLiquidation.ToString("N2"); }
        }

        public double TotalPnl
        {
            get { return _totalPnl; }
            set { _totalPnl = value; OnPropertyChanged("TotalPnl"); OnPropertyChanged("TotalPnlDisplay"); }
        }

        public string TotalPnlDisplay
        {
            get { return FormatCurrency(_totalPnl); }
        }

        public int Position
        {
            get { return _position; }
            set { _position = value; OnPropertyChanged("Position"); OnPropertyChanged("PositionDisplay"); }
        }

        public string PositionDisplay
        {
            get { return _position == 0 ? "-" : _position.ToString(); }
        }

        private static string FormatCurrency(double val)
        {
            if (val == 0) return "$0.00";
            if (val < 0) return "($" + (-val).ToString("N2") + ")";
            return "$" + val.ToString("N2");
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

    public class RemoteAccountState
    {
        public string AccountName  { get; set; }
        public bool   IsMaster     { get; set; }
        public bool   IsActive     { get; set; }
        public int    ContractSize { get; set; }
    }
}

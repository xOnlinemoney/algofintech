#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Xml.Linq;
using System.Xml.Serialization;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.Gui.Tools;
using NinjaTrader.NinjaScript;
#endregion

// ═══════════════════════════════════════════════════════════════════
// AlgoFintech Trade Copier — NinjaTrader 8 Add-On
//
// Monitors a master account for trade fills, then copies those trades
// to all configured slave accounts with configurable contract sizes.
//
// Install: Copy DLL to Documents\NinjaTrader 8\bin\Custom\AddOns\
// Config:  Documents\NinjaTrader 8\AlgoFintechCopier\config.json
// ═══════════════════════════════════════════════════════════════════

namespace NinjaTrader.Gui.NinjaScript
{
    // ─── AddOn Entry Point ───────────────────────────────────────
    // NT creates an instance and calls OnWindowCreated/Destroyed for every NTWindow
    public class AlgoFintechCopier : AddOnBase
    {
        private NTMenuItem copierMenuItem;
        private NTMenuItem existingMenuItemInControlCenter;

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "AlgoFintech Trade Copier — copies trades from master to slave accounts";
                Name        = "AlgoFintech Copier";
            }
        }

        protected override void OnWindowCreated(Window window)
        {
            ControlCenter cc = window as ControlCenter;
            if (cc == null) return;

            existingMenuItemInControlCenter = cc.FindFirst("ControlCenterMenuItemNew") as NTMenuItem;
            if (existingMenuItemInControlCenter == null) return;

            copierMenuItem = new NTMenuItem
            {
                Header = "AlgoFintech Copier",
                Style  = Application.Current.TryFindResource("MainMenuItem") as Style
            };

            existingMenuItemInControlCenter.Items.Add(copierMenuItem);
            copierMenuItem.Click += OnMenuItemClick;
        }

        protected override void OnWindowDestroyed(Window window)
        {
            if (copierMenuItem != null && window is ControlCenter)
            {
                if (existingMenuItemInControlCenter != null &&
                    existingMenuItemInControlCenter.Items.Contains(copierMenuItem))
                    existingMenuItemInControlCenter.Items.Remove(copierMenuItem);

                copierMenuItem.Click -= OnMenuItemClick;
                copierMenuItem = null;
            }
        }

        private void OnMenuItemClick(object sender, RoutedEventArgs e)
        {
            Core.Globals.RandomDispatcher.BeginInvoke(new Action(() =>
                new AlgoFintechCopierWindow().Show()));
        }
    }

    // ─── Tab Factory ─────────────────────────────────────────────
    public class AlgoFintechCopierWindowFactory : INTTabFactory
    {
        public NTWindow CreateParentWindow()
        {
            return new AlgoFintechCopierWindow();
        }

        public NTTabPage CreateTabPage(string typeName, bool isTrue)
        {
            return new AlgoFintechCopierTab();
        }
    }

    // ─── Main Window ─────────────────────────────────────────────
    public class AlgoFintechCopierWindow : NTWindow, IWorkspacePersistence
    {
        public AlgoFintechCopierWindow()
        {
            Caption = "AlgoFintech Copier";
            Width   = 900;
            Height  = 650;

            TabControl tc = new TabControl();
            TabControlManager.SetIsMovable(tc, true);
            TabControlManager.SetCanAddTabs(tc, false);
            TabControlManager.SetCanRemoveTabs(tc, false);
            TabControlManager.SetFactory(tc, new AlgoFintechCopierWindowFactory());
            Content = tc;

            tc.AddNTTabPage(new AlgoFintechCopierTab());

            Loaded += (o, e) =>
            {
                if (WorkspaceOptions == null)
                    WorkspaceOptions = new WorkspaceOptions(
                        "AlgoFintechCopier-" + Guid.NewGuid().ToString("N"), this);
            };
        }

        public void Restore(XDocument document, XElement element)
        {
            if (MainTabControl != null) MainTabControl.RestoreFromXElement(element);
        }

        public void Save(XDocument document, XElement element)
        {
            if (MainTabControl != null) MainTabControl.SaveToXElement(element);
        }

        public WorkspaceOptions WorkspaceOptions { get; set; }
    }
}

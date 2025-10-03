import Head from "next/head";
import { useEffect, useState } from "react";
import { useAdminRuntimeConfig, usePatchRuntimeConfig } from "@/api";

export default function SettingsView() {
  const [tab, setTab] = useState<
    "general" | "security" | "billing" | "integrations" | "runtime"
  >("general");
  const { data: runtimeConfig } = useAdminRuntimeConfig();
  const patchRuntime = usePatchRuntimeConfig();
  const [runtimeEditor, setRuntimeEditor] = useState<string>("");
  useEffect(() => {
    if (runtimeConfig) setRuntimeEditor(JSON.stringify(runtimeConfig, null, 2));
  }, [runtimeConfig]);

  return (
    <div className="space-y-6">
      <Head>
        <title>Settings — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure platform preferences & admin options
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { key: "general", label: "General" },
          { key: "security", label: "Security" },
          { key: "billing", label: "Billing" },
          { key: "integrations", label: "Integrations" },
          { key: "runtime", label: "Runtime Config" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              tab === t.key
                ? "bg-[#4EA8A1] text-white border-[#4EA8A1]"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Platform Identity
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Site Name
                </label>
                <input
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue="Inda"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Support Email
                </label>
                <input
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  placeholder="support@example.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm hover:bg-[#4EA8A1]/90">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Notification Preferences
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#4EA8A1]"
                  defaultChecked
                />
                Email alerts for new payments
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#4EA8A1]"
                  defaultChecked
                />
                Weekly activity summary
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" className="accent-[#4EA8A1]" />
                Product announcements
              </label>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm hover:bg-[#4EA8A1]/90">
                Update Preferences
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === "security" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Password Policy
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Min Length
                </label>
                <input
                  type="number"
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue={8}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Require Numbers
                </label>
                <select
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue="yes"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Require Symbols
                </label>
                <select
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue="yes"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm hover:bg-[#4EA8A1]/90">
                Save Policy
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Require 2FA for all admin logins to enhance security.
            </p>
            <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm hover:bg-[#4EA8A1]/90">
              Enforce 2FA
            </button>
          </div>
        </section>
      )}

      {tab === "billing" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Billing Settings
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Default Currency
                </label>
                <select
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue="NGN"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  className="h-10 px-3 rounded border border-gray-300 text-sm"
                  defaultValue={0}
                />
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm hover:bg-[#4EA8A1]/90">
                Save Billing
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Invoice Branding
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a logo to use on generated invoices (coming soon).
            </p>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm cursor-not-allowed"
              disabled
            >
              Upload Logo
            </button>
          </div>
        </section>
      )}

      {tab === "integrations" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Payment Providers
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Flutterwave</span>
                  <span className="text-xs text-gray-500">Connected</span>
                </div>
                <button className="px-3 py-1.5 text-xs rounded-md bg-[#4EA8A1] text-white hover:bg-[#4EA8A1]/90">
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Paystack</span>
                  <span className="text-xs text-gray-500">Not Connected</span>
                </div>
                <button className="px-3 py-1.5 text-xs rounded-md border border-[#4EA8A1] text-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white">
                  Connect
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Webhooks
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure webhook endpoints for real-time event delivery (coming
              soon).
            </p>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm cursor-not-allowed"
              disabled
            >
              Create Endpoint
            </button>
          </div>
        </section>
      )}

      {tab === "runtime" && (
        <section className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">
              Runtime Config (JSON)
            </h2>
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Edit the runtime configuration as JSON. Be careful—changes take effect immediately for new requests.
              </p>
              <textarea
                value={runtimeEditor}
                onChange={(e) => setRuntimeEditor(e.target.value)}
                className="w-full h-[60vh] border rounded p-2 font-mono text-xs"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    try {
                      const body = runtimeEditor ? JSON.parse(runtimeEditor) : {};
                      patchRuntime.mutate(body as any);
                    } catch (e) {
                      alert("Invalid JSON: " + (e as Error).message);
                    }
                  }}
                  disabled={patchRuntime.status === "pending"}
                  className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm disabled:opacity-50"
                >
                  {patchRuntime.status === "pending" ? "Saving…" : "Save Config"}
                </button>
                <button
                  onClick={() =>
                    setRuntimeEditor(JSON.stringify(runtimeConfig ?? {}, null, 2))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

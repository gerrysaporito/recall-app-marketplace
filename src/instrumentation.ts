if (!global?.initializedServices) {
  global.initializedServices = {
    ...global.initializedServices,
    nodeJsRuntime: false,
  };
}

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    !global.initializedServices?.nodeJsRuntime
  ) {
    console.info("Initializing Node.js runtime services...");
    await import("@/server/services/WebhookQueueingService").catch((err) =>
      console.error("Failed to load QueueingService:", err)
    );
    console.info("Node.js runtime services initialized.");
    global.initializedServices.nodeJsRuntime = true;
  }
}

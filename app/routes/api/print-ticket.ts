import type { ActionFunctionArgs } from "react-router";
import { printTicket } from "~/services/printer.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const ticketStr = formData.get("ticket");
    const configStr = formData.get("config");

    if (!ticketStr) {
      return Response.json({ success: false, message: "Missing ticket data" }, { status: 400 });
    }

    const ticket = JSON.parse(ticketStr as string);
    const config = configStr ? JSON.parse(configStr as string) : { type: 'network', ip: '192.168.1.100' };

    await printTicket(ticket, config);
    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Print error:", error);
    return Response.json({ success: false, message: error.message || "Failed to print" }, { status: 500 });
  }
}

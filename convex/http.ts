import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const storageId = new URL(request.url).pathname.split("/").pop();
    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }
    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", { status: 404 });
    }
    return new Response(blob, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": blob.type,
      },
    });
  }),
});

export default http;

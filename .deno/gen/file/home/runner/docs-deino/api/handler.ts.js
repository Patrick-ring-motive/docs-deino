import './link-resolver.js';
import './text-rewriter.js';
import './dino.css.js';
import './dino.js';
import './host-bridge.js';
let hostTarget = "docs.deno.com";
let docsTarget = "docs.deno.com";
const skipRequestHeaders = [
    'x-forwarded-for'
];
const skipResponseHeaders = [
    "connection",
    "content-length",
    'x-frame-options',
    'x-content-type-options'
];
let injects = globalThis['link-resolver-import'] + globalThis['text-rewriter'] + globalThis.dinoCSS + globalThis.dino + globalThis['host-bridge'];
export default async function(req) {
    if (req.method == "OPTIONS" || req.url == '*') {
        return new Response("", {
            headers: {
                Allow: "OPTIONS, GET, HEAD, POST"
            }
        });
    }
    let reqURL = req.url.replace('_root/', '').replace('_root', '');
    let url = reqURL.split('/');
    let flatURL = reqURL.split('?')[0].split('#')[0];
    let localhost = url[2];
    url[2] = hostTarget;
    if (reqURL.includes('hostname=')) {
        url[2] = reqURL.split('hostname=')[1].split('&')[0].split('#')[0];
    }
    if (reqURL.includes('/manual')) {
        url[2] = docsTarget;
    }
    let request = new Request(url.join("/"));
    for(let header in request.headers.keys){
        if (header) {
            if (skipRequestHeaders.includes(header.toLowerCase())) {
                continue;
            }
            request.headers.set(header, request.headers.get(header).toString().replace(localhost, hostTarget));
        }
    }
    request = addCacheHeaders(request);
    let res = await fetch(request);
    let body = "";
    let htmlFlag = false;
    if (!res.headers.has('Content-Type') || !res.headers.get('content-type')) {
        body = await res.arrayBuffer();
        const typedArray = new Uint8Array(body);
        let array = [
            ...typedArray
        ];
        array.length = 50;
        //console.log(String.fromCharCode(...array));
        htmlFlag = true;
    } else {
        let ct = res.headers.get('content-type').toLowerCase();
        //console.log(ct);
        if (ct.includes('text')) {
            let headText = injects;
            body = (await res.text()).replace('<head>', '<head>' + headText).replace('</head>', headText + '</head>');
            if (body.includes('<html') || ct.includes('plain')) {
                htmlFlag = true;
            }
        } else if (flatURL.endsWith('.js')) {
            body = (await res.text()).replaceAll(hostTarget, localhost);
        } else if (res.body) {
            body = await res.arrayBuffer();
            const typedArray = new Uint8Array(body);
            let array = [
                ...typedArray
            ];
            array.length = 50;
        //console.log(String.fromCharCode(...array));
        }
    }
    let response = new Response(body);
    for(let header in response.headers.keys){
        if (header) {
            if (skipResponseHeaders.includes(header.toLowerCase())) {
                continue;
            }
            request.headers.set(header, response.headers.get(header).toString().replace(hostTarget, localhost));
        }
    }
    if (htmlFlag) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (!response.headers.get('Content-Type')) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (response.headers.get('Content-Type').toLowerCase().includes('plain')) {
        response.headers.set('Content-Type', 'text/html');
    }
    if (flatURL.endsWith('.js')) {
        response.headers.set('Content-Type', 'text/javascript');
    }
    if (flatURL.endsWith('.css')) {
        response.headers.set('Content-Type', 'text/css');
    }
    if (flatURL.endsWith('.svg')) {
        response.headers.set('Content-Type', 'image/svg+xml');
    }
    if (flatURL.endsWith('.png')) {
        response.headers.set('Content-Type', 'image/png');
    }
    if (flatURL.endsWith('.jpg') || flatURL.endsWith('.jpeg')) {
        response.headers.set('Content-Type', 'image/jpeg');
    }
    //console.log(response.headers.get('content-type'));
    response = addCacheHeaders(response);
    return response;
}
function addCacheHeaders(re) {
    re.headers.set("CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Surrogate-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Vercel-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    return re;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvZG9jcy1kZWluby9hcGkvaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbGluay1yZXNvbHZlci5qcyc7XG5pbXBvcnQgJy4vdGV4dC1yZXdyaXRlci5qcyc7XG5pbXBvcnQgJy4vZGluby5jc3MuanMnO1xuaW1wb3J0ICcuL2Rpbm8uanMnO1xuaW1wb3J0ICcuL2hvc3QtYnJpZGdlLmpzJztcbmxldCBob3N0VGFyZ2V0ID0gXCJkb2NzLmRlbm8uY29tXCI7XG5sZXQgZG9jc1RhcmdldCA9IFwiZG9jcy5kZW5vLmNvbVwiO1xuXG5jb25zdCBza2lwUmVxdWVzdEhlYWRlcnM6IHN0cmluZ1tdID0gWyd4LWZvcndhcmRlZC1mb3InXTtcbmNvbnN0IHNraXBSZXNwb25zZUhlYWRlcnMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbm5lY3Rpb25cIiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGVudC1sZW5ndGhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gtZnJhbWUtb3B0aW9ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4LWNvbnRlbnQtdHlwZS1vcHRpb25zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG5cbmxldCBpbmplY3RzID0gZ2xvYmFsVGhpc1snbGluay1yZXNvbHZlci1pbXBvcnQnXStcbiAgZ2xvYmFsVGhpc1sndGV4dC1yZXdyaXRlciddK1xuICBnbG9iYWxUaGlzLmRpbm9DU1MrIFxuICBnbG9iYWxUaGlzLmRpbm8rXG4gIGdsb2JhbFRoaXNbJ2hvc3QtYnJpZGdlJ107XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChyZXE6IFJlcXVlc3QpIHtcblxuICBpZiAoKHJlcS5tZXRob2QgPT0gXCJPUFRJT05TXCIpfHwocmVxLnVybD09JyonKSkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJcIix7aGVhZGVyczp7QWxsb3c6IFwiT1BUSU9OUywgR0VULCBIRUFELCBQT1NUXCJ9fSk7XG4gIH1cbiBcbiAgbGV0IHJlcVVSTCA9IHJlcS51cmwucmVwbGFjZSgnX3Jvb3QvJywnJykucmVwbGFjZSgnX3Jvb3QnLCcnKTtcbiAgbGV0IHVybD1yZXFVUkwuc3BsaXQoJy8nKTtcbiAgbGV0IGZsYXRVUkwgPSByZXFVUkwuc3BsaXQoJz8nKVswXS5zcGxpdCgnIycpWzBdO1xuICBsZXQgbG9jYWxob3N0ID0gdXJsWzJdO1xuICB1cmxbMl0gPSBob3N0VGFyZ2V0O1xuICBpZihyZXFVUkwuaW5jbHVkZXMoJ2hvc3RuYW1lPScpKXtcbiAgICB1cmxbMl09cmVxVVJMLnNwbGl0KCdob3N0bmFtZT0nKVsxXS5zcGxpdCgnJicpWzBdLnNwbGl0KCcjJylbMF07XG4gIH1cbiAgaWYocmVxVVJMLmluY2x1ZGVzKCcvbWFudWFsJykpe1xuICAgIHVybFsyXT1kb2NzVGFyZ2V0O1xuICB9XG4gIGxldCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLmpvaW4oXCIvXCIpKTtcbiAgXG4gIGZvciAobGV0IGhlYWRlciBpbiByZXF1ZXN0LmhlYWRlcnMua2V5cykge1xuICAgIGlmIChoZWFkZXIpIHtcbiAgICAgIGlmIChza2lwUmVxdWVzdEhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldChcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuZ2V0KGhlYWRlcikudG9TdHJpbmcoKS5yZXBsYWNlKGxvY2FsaG9zdCwgaG9zdFRhcmdldCksXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXF1ZXN0ID0gYWRkQ2FjaGVIZWFkZXJzKHJlcXVlc3QpO1xuICBsZXQgcmVzID0gYXdhaXQgZmV0Y2gocmVxdWVzdCk7XG5cbiAgbGV0IGJvZHkgPSBcIlwiO1xuICBsZXQgaHRtbEZsYWcgPSBmYWxzZTtcbiAgaWYoKCFyZXMuaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKXx8KCFyZXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSl7XG4gICAgYm9keSA9IGF3YWl0IHJlcy5hcnJheUJ1ZmZlcigpO1xuICAgIGNvbnN0IHR5cGVkQXJyYXkgPSBuZXcgVWludDhBcnJheShib2R5KTtcbiAgICBsZXQgYXJyYXkgPSBbLi4udHlwZWRBcnJheV07XG4gICAgYXJyYXkubGVuZ3RoPTUwO1xuICAgIC8vY29uc29sZS5sb2coU3RyaW5nLmZyb21DaGFyQ29kZSguLi5hcnJheSkpO1xuICAgIGh0bWxGbGFnPXRydWU7XG4gIH0gXG4gZWxzZXtcbiAgIGxldCBjdD1yZXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpLnRvTG93ZXJDYXNlKCk7XG4gICAvL2NvbnNvbGUubG9nKGN0KTtcbiAgIGlmKGN0LmluY2x1ZGVzKCd0ZXh0Jykpe1xuICAgICAgbGV0IGhlYWRUZXh0PWluamVjdHM7XG4gICAgICBib2R5PShhd2FpdCByZXMudGV4dCgpKVxuICAgICAgICAucmVwbGFjZSgnPGhlYWQ+JywnPGhlYWQ+JytoZWFkVGV4dClcbiAgICAgICAgLnJlcGxhY2UoJzwvaGVhZD4nLGhlYWRUZXh0Kyc8L2hlYWQ+Jyk7XG4gICAgICBpZihib2R5LmluY2x1ZGVzKCc8aHRtbCcpfHxjdC5pbmNsdWRlcygncGxhaW4nKSl7aHRtbEZsYWc9dHJ1ZTt9XG4gICAgfVxuIGVsc2UgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLmpzJykpe1xuICAgIGJvZHk9KGF3YWl0IHJlcy50ZXh0KCkpLnJlcGxhY2VBbGwoaG9zdFRhcmdldCxsb2NhbGhvc3QpO1xuICB9XG4gIGVsc2UgaWYgKHJlcy5ib2R5KSB7XG4gICAgYm9keSA9IGF3YWl0IHJlcy5hcnJheUJ1ZmZlcigpO1xuICAgIGNvbnN0IHR5cGVkQXJyYXkgPSBuZXcgVWludDhBcnJheShib2R5KTtcbiAgICBsZXQgYXJyYXkgPSBbLi4udHlwZWRBcnJheV07XG4gICAgYXJyYXkubGVuZ3RoPTUwO1xuICAgIC8vY29uc29sZS5sb2coU3RyaW5nLmZyb21DaGFyQ29kZSguLi5hcnJheSkpO1xuICB9XG59XG4gIGxldCByZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5KTtcbiAgZm9yIChsZXQgaGVhZGVyIGluIHJlc3BvbnNlLmhlYWRlcnMua2V5cykge1xuICAgIGlmIChoZWFkZXIpIHtcbiAgICAgIGlmIChza2lwUmVzcG9uc2VIZWFkZXJzLmluY2x1ZGVzKGhlYWRlci50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoXG4gICAgICAgIGhlYWRlcixcbiAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5nZXQoaGVhZGVyKS50b1N0cmluZygpLnJlcGxhY2UoaG9zdFRhcmdldCwgbG9jYWxob3N0KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaWYoaHRtbEZsYWcpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCd0ZXh0L2h0bWwnKTtcbiAgfVxuICBpZighcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywndGV4dC9odG1sJyk7XG4gIH1cbiAgaWYocmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3BsYWluJykpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCd0ZXh0L2h0bWwnKTtcbiAgfVxuICBpZihmbGF0VVJMLmVuZHNXaXRoKCcuanMnKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvamF2YXNjcmlwdCcpO1xuICB9XG4gIGlmKGZsYXRVUkwuZW5kc1dpdGgoJy5jc3MnKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvY3NzJyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLnN2ZycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywnaW1hZ2Uvc3ZnK3htbCcpO1xuICB9XG4gIGlmKGZsYXRVUkwuZW5kc1dpdGgoJy5wbmcnKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ2ltYWdlL3BuZycpO1xuICB9XG4gIGlmKGZsYXRVUkwuZW5kc1dpdGgoJy5qcGcnKXx8ZmxhdFVSTC5lbmRzV2l0aCgnLmpwZWcnKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ2ltYWdlL2pwZWcnKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSk7XG4gIHJlc3BvbnNlID0gYWRkQ2FjaGVIZWFkZXJzKHJlc3BvbnNlKTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5cbmZ1bmN0aW9uIGFkZENhY2hlSGVhZGVycyhyZSl7XG4gIHJlLmhlYWRlcnMuc2V0KFwiQ0ROLUNhY2hlLUNvbnRyb2xcIixcbiAgICBcInB1YmxpYywgbWF4LWFnZT05NjQwMCwgcy1tYXgtYWdlPTk2NDAwLCBzdGFsZS1pZi1lcnJvcj0zMTUzNTAwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMTUzNTAwMFwiXG4gKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJDYWNoZS1Db250cm9sXCIsXG4gICBcInB1YmxpYywgbWF4LWFnZT05NjQwMCwgcy1tYXgtYWdlPTk2NDAwLCBzdGFsZS1pZi1lcnJvcj0zMTUzNTAwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMTUzNTAwMFwiXG4pO1xuICByZS5oZWFkZXJzLnNldCggXCJDbG91ZGZsYXJlLUNETi1DYWNoZS1Db250cm9sXCIsXG4gICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJTdXJyb2dhdGUtQ29udHJvbFwiLFxuICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJWZXJjZWwtQ0ROLUNhY2hlLUNvbnRyb2xcIixcbiAgIFwicHVibGljLCBtYXgtYWdlPTk2NDAwLCBzLW1heC1hZ2U9OTY0MDAsIHN0YWxlLWlmLWVycm9yPTMxNTM1MDAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlPTMxNTM1MDAwXCJcbik7XG4gIHJldHVybiByZTtcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sbUJBQW1CO0FBQzFCLElBQUksYUFBYTtBQUNqQixJQUFJLGFBQWE7QUFFakIsTUFBTSxxQkFBK0I7SUFBQztDQUFrQjtBQUN4RCxNQUFNLHNCQUFzQjtJQUNFO0lBQ0Q7SUFDQTtJQUNBO0NBQ0E7QUFFN0IsSUFBSSxVQUFVLFVBQVUsQ0FBQyx1QkFBdUIsR0FDOUMsVUFBVSxDQUFDLGdCQUFnQixHQUMzQixXQUFXLFVBQ1gsV0FBVyxPQUNYLFVBQVUsQ0FBQyxjQUFjO0FBRTNCLGVBQWUsZUFBZ0IsR0FBWTtJQUV6QyxJQUFJLEFBQUMsSUFBSSxVQUFVLGFBQWEsSUFBSSxPQUFLLEtBQU07UUFDN0MsT0FBTyxJQUFJLFNBQVMsSUFBRztZQUFDLFNBQVE7Z0JBQUMsT0FBTztZQUEwQjtRQUFDO0lBQ3JFO0lBRUEsSUFBSSxTQUFTLElBQUksSUFBSSxRQUFRLFVBQVMsSUFBSSxRQUFR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
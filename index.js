const http = require("http");
const fs = require("fs");

const httpServer = http.createServer();
httpServer.on("listening", () => console.log("Listening..."));

let chunks = null;
let startTime = null;
httpServer.on("request", (req,res) => {
    if (req.url === "/") {
        res.end(fs.readFileSync("index.html"));
        return;
    }
    else if (req.url === "/upload") {
        const fileName = req.headers["file-name"];
        const chunkId = parseInt(req.headers["chunk-index"]);
        if (chunkId === 0) {
            startTime = performance.now();
        }
        const NUM_CHUNKS = parseInt(req.headers["num-chunks"]);
        const CHUNK_SIZE = parseInt(req.headers["chunk-size"]);
        const chunkLength = parseInt(req.headers["content-length"]);
        chunks = !chunks ? new Array(NUM_CHUNKS) : chunks;

        req.on("data", chunk => {
            chunks[chunkId] = chunk;
            console.log(`Recieved Chunk Length: ${chunk.length} ${chunkId}`);
        })
        res.end("Uploaded", async () => {
            if (chunkLength < CHUNK_SIZE) {
                for (let i = 0; i < NUM_CHUNKS; i++) {
                    const chunk = chunks[i];
                    if (chunk) {
                        fs.appendFileSync(fileName, chunk);
                    }
                }
                const endTime = performance.now();
                console.log(endTime-startTime);
            }
        });
        return;
    }
})

httpServer.listen(8080);
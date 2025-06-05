const http=require("http")
const express = require("express");
const {Server}=require("socket.io")
const app = express();

app.use(express.static("./public"))

const server = http.createServer(app)
const io = new Server(server)  //new server

// socket.io 
io.on("connection",(socket)=>{

})


app.get("/",(res,req)=>{
    return res.sendFile("./public/index.html")
})

server.listen(9000,()=>console.log(`Server started at port 9000`))
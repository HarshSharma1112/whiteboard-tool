
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = "pen";
let drawing = false;
let startX, startY;
let objects = [];
let history = [];
let redoStack = [];
let currentPath = null;

function setTool(t) {
  tool = t;
  document.querySelectorAll(".tool").forEach(el => el.classList.remove("active"));
  event.target.classList.add("active");
}

function saveState() {
  history.push(JSON.stringify(objects));
  redoStack = [];
}

function redraw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  objects.forEach(o => draw(o));
}

function draw(o) {
  ctx.strokeStyle = o.color;
  ctx.lineWidth = o.size;

  if (o.type === "path") {
    ctx.beginPath();
    o.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.stroke();
  }
  if (o.type === "rect") ctx.strokeRect(o.x,o.y,o.w,o.h);
  if (o.type === "circle") {
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
    ctx.stroke();
  }
  if (o.type === "line") {
    ctx.beginPath();
    ctx.moveTo(o.x1,o.y1);
    ctx.lineTo(o.x2,o.y2);
    ctx.stroke();
  }
  if (o.type === "text") {
    ctx.fillStyle = o.color;
    ctx.font = "20px Inter";
    ctx.fillText(o.text,o.x,o.y);
  }
}

canvas.onmousedown = e => {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (tool === "pen") {
    currentPath = {
      type:"path",
      color:color.value,
      size:size.value,
      points:[{x:startX,y:startY}]
    };
    objects.push(currentPath);
  }
};

canvas.onmousemove = e => {
  if (!drawing) return;
  if (tool === "pen") {
    currentPath.points.push({x:e.offsetX,y:e.offsetY});
    redraw();
  }
};

canvas.onmouseup = e => {
  drawing = false;
  const x=e.offsetX, y=e.offsetY;

  if (tool==="rect")
    objects.push({type:"rect",x:startX,y:startY,w:x-startX,h:y-startY,color:color.value,size:size.value});
  if (tool==="circle")
    objects.push({type:"circle",x:startX,y:startY,r:Math.hypot(x-startX,y-startY),color:color.value,size:size.value});
  if (tool==="line")
    objects.push({type:"line",x1:startX,y1:startY,x2:x,y2:y,color:color.value,size:size.value});

  saveState();
  redraw();
};

canvas.ondblclick = e => {
  if (tool==="text") {
    const t=prompt("Text");
    if(t){
      objects.push({type:"text",x:e.offsetX,y:e.offsetY,text:t,color:color.value});
      saveState(); redraw();
    }
  }
};

function undo(){
  if(history.length){
    redoStack.push(history.pop());
    objects=history.length?JSON.parse(history[history.length-1]):[];
    redraw();
  }
}
function redo(){
  if(redoStack.length){
    const s=redoStack.pop();
    history.push(s);
    objects=JSON.parse(s);
    redraw();
  }
}
function save(){
  localStorage.setItem("forgeboard",JSON.stringify(objects));
}
function load(){
  const d=localStorage.getItem("forgeboard");
  if(d){objects=JSON.parse(d); redraw();}
}
function exportPNG(){
  const a=document.createElement("a");
  a.download="forgeboard.png";
  a.href=canvas.toDataURL();
  a.click();
}

saveState();

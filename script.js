/* STUDENT DATA */
let students = [
    {id:"S101", name:"Aarav"},
    {id:"S102", name:"Priya"},
    {id:"S103", name:"Rahul"},
    {id:"S104", name:"Ananya"}
  ];
  
  let attendance = {};
  let video = document.getElementById("video");
  
  /* PAGE NAVIGATION */
  function showPage(p){
    ["home","login","class","attendance","report","analysis"].forEach(id=>{
      document.getElementById(id).classList.add("hidden");
    });
    document.getElementById(p).classList.remove("hidden");
  
    if(p==="report") loadReport();
    if(p==="analysis") loadAnalysis();
  }
  
  /* LOGIN */
  function login(){
    if(staffId.value && staffPass.value){
      alert("Staff authenticated");
      showPage("class");
    } else {
      alert("Invalid login");
    }
  }
  
  /* LOAD STUDENTS */
  function loadStudents(){
    if(!classSelect.value) return alert("Select class");
  
    showPage("attendance");
    studentTable.innerHTML = "";
  
    students.forEach(s=>{
      attendance[s.id] = "Absent";
      studentTable.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.name}</td>
          <td><button onclick="mark('${s.id}','Face')">Scan</button></td>
          <td><button onclick="mark('${s.id}','Fingerprint')">Scan</button></td>
          <td id="st-${s.id}">Absent</td>
        </tr>
      `;
    });
  }
  
  /* START FRONT CAMERA (MOBILE FRIENDLY) */
  async function startCamera(){
    try{
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          'https://unpkg.com/face-api.js/models'
        )
      ]);
  
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
  
      video.srcObject = stream;
      await video.play();
    } catch(err){
      alert("Camera access denied or HTTPS required");
      console.error(err);
    }
  }
  
  /* MARK ATTENDANCE */
  async function mark(id, method){
    if(method === "Face"){
  
      // Start camera only on button click
      if(!video.srcObject){
        await startCamera();
      }
  
      setTimeout(async ()=>{
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
  
        if(detection){
          attendance[id] = "Present (Face Verified)";
          document.getElementById("st-"+id).innerHTML =
            "<span class='success'>Present (Face)</span>";
        } else {
          alert("Face not detected. Try again.");
        }
      }, 1000);
  
    } else {
      fingerprintAuth(id);
    }
  }
  
  /* FINGERPRINT AUTH (SIMULATED) */
  function fingerprintAuth(id){
    if(window.PublicKeyCredential){
      attendance[id] = "Present (Fingerprint Verified)";
      document.getElementById("st-"+id).innerHTML =
        "<span class='success'>Present (Fingerprint)</span>";
    } else {
      alert("Fingerprint not supported on this device");
    }
  }
  
  /* REPORT */
  function loadReport(){
    reportTable.innerHTML = "";
    students.forEach(s=>{
      reportTable.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>${attendance[s.id]}</td>
        </tr>
      `;
    });
  }
  
  /* ANALYSIS */
  function loadAnalysis(){
    let presentCount = 0;
    students.forEach(s=>{
      if(attendance[s.id].startsWith("Present")) presentCount++;
    });
  
    total.innerText = students.length;
    present.innerText = presentCount;
    absent.innerText = students.length - presentCount;
  }
  
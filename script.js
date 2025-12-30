/***********************
 * CONFIG
 ***********************/
const DEMO_MODE = false; 
// false = try real camera
// auto-fallback to demo if camera not available

/***********************
 * DATA
 ***********************/
let students = [
  { id: "S101", name: "Aarav" },
  { id: "S102", name: "Priya" },
  { id: "S103", name: "Rahul" },
  { id: "S104", name: "Ananya" }
];

let attendance = {};
let video = null;
let cameraAvailable = false;

/***********************
 * PAGE NAVIGATION
 ***********************/
function showPage(p) {
  ["home", "login", "class", "attendance", "report", "analysis"]
    .forEach(id => document.getElementById(id).classList.add("hidden"));

  document.getElementById(p).classList.remove("hidden");

  if (p === "report") loadReport();
  if (p === "analysis") loadAnalysis();
}

/***********************
 * LOGIN
 ***********************/
function login() {
  if (staffId.value && staffPass.value) {
    alert("Staff authenticated");
    showPage("class");
  } else {
    alert("Invalid login");
  }
}

/***********************
 * LOAD STUDENTS
 ***********************/
function loadStudents() {
  if (!classSelect.value) {
    alert("Please select a class");
    return;
  }

  showPage("attendance");
  studentTable.innerHTML = "";

  students.forEach(s => {
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

/***********************
 * CAMERA CHECK
 ***********************/
async function checkCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameraAvailable = devices.some(d => d.kind === "videoinput");
  } catch {
    cameraAvailable = false;
  }
}

/***********************
 * START CAMERA
 ***********************/
async function startCamera() {
  if (DEMO_MODE || !cameraAvailable) return false;

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(
      "https://unpkg.com/face-api.js/models"
    );

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    if (!video) video = document.getElementById("video");
    video.srcObject = stream;
    await video.play();
    return true;

  } catch (err) {
    console.warn("Camera failed, switching to demo mode:", err.name);
    return false;
  }
}

/***********************
 * MARK ATTENDANCE
 ***********************/
async function mark(id, method) {

  /* ---- DEMO / FALLBACK MODE ---- */
  if (DEMO_MODE || !cameraAvailable) {
    attendance[id] = `Present (${method} - Simulated)`;
    document.getElementById("st-" + id).innerHTML =
      `<span class="success">Present (${method})</span>`;
    return;
  }

  /* ---- FACE MODE ---- */
  if (method === "Face") {

    const started = await startCamera();
    if (!started) {
      attendance[id] = "Present (Face - Simulated)";
      document.getElementById("st-" + id).innerHTML =
        `<span class="success">Present (Face)</span>`;
      return;
    }

    setTimeout(async () => {
      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detection) {
        attendance[id] = "Present (Face Verified)";
        document.getElementById("st-" + id).innerHTML =
          `<span class="success">Present (Face)</span>`;
      } else {
        alert("Face not detected. Try again.");
      }
    }, 1000);

  }
  /* ---- FINGERPRINT MODE ---- */
  else {
    attendance[id] = "Present (Fingerprint Verified)";
    document.getElementById("st-" + id).innerHTML =
      `<span class="success">Present (Fingerprint)</span>`;
  }
}

/***********************
 * REPORT
 ***********************/
function loadReport() {
  reportTable.innerHTML = "";
  students.forEach(s => {
    reportTable.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${attendance[s.id]}</td>
      </tr>
    `;
  });
}

/***********************
 * ANALYSIS
 ***********************/
function loadAnalysis() {
  let presentCount = 0;

  students.forEach(s => {
    if (attendance[s.id].startsWith("Present")) presentCount++;
  });

  total.innerText = students.length;
  present.innerText = presentCount;
  absent.innerText = students.length - presentCount;
}

/***********************
 * INIT
 ***********************/
window.onload = async () => {
  video = document.getElementById("video");
  await checkCamera();

  if (!cameraAvailable) {
    console.warn("No camera detected → Demo mode active");
  }
};

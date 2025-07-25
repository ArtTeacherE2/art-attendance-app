let studentData = {
  "1st": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "2nd": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "3rd": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "4th": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "5th": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "6th": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "7th": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`})),
  "8th": Array.from({length: 28}, (_, i) => ({name: `Student ${i+1}`, seat: `Seat ${i+1}`}))
};

let students = [];
let currentPeriod = "1st";
let bathroomTimers = {};

function loadStudents() {
    currentPeriod = document.getElementById("periodSelect").value;
    const saved = localStorage.getItem(`attendance-${currentPeriod}`);
    if (saved) {
        students = JSON.parse(saved);
    } else {
        students = studentData[currentPeriod].map(s => ({
            ...s,
            status: 'Not Checked In',
            log: []
        }));
    }
    renderStudents();
    updateBathroomTimers();
}

function saveCurrentState() {
    localStorage.setItem(`attendance-${currentPeriod}`, JSON.stringify(students));
}

function renderStudents() {
    const container = document.getElementById('students');
    container.innerHTML = '';
    students.forEach((student, index) => {
        const div = document.createElement('div');
        div.className = 'student';
        div.innerHTML = `
            <strong>${student.name}</strong><br>
            ${student.seat}<br>
            Status: ${student.status} <span id='timer-${index}' style='font-weight: bold; color: red;'></span><br>
            <button class="status-btn present" onclick="setStatus(${index}, 'Present')">Present</button>
            <button class="status-btn bathroom" onclick="setStatus(${index}, 'Bathroom')">Bathroom</button>
            <button class="status-btn nurse" onclick="setStatus(${index}, 'Nurse')">Nurse</button>
            <button class="status-btn office" onclick="setStatus(${index}, 'Office')">Office</button>
            <button class="status-btn guidance" onclick="setStatus(${index}, 'Guidance')">Guidance</button>
            <button class="status-btn checkout" onclick="setStatus(${index}, 'Check Out')">Check Out</button>
            <button class="status-btn teacher" onclick="setTeacher(${index})">Teacher</button>
        `;
        container.appendChild(div);
    });
}

function updateBathroomTimers() {
    students.forEach((student, index) => {
        if (student.status === "Bathroom" && bathroomTimers[index]) {
            const now = new Date();
            const diff = now - bathroomTimers[index];
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            const display = document.getElementById("timer-" + index);
            if (display) {
                display.innerText = `${mins}m ${secs}s`;
            }
        }
    });
    setTimeout(updateBathroomTimers, 1000);
}

function setStatus(index, status) {
    if (status === 'Bathroom') {
        bathroomTimers[index] = new Date();
    } else if (students[index].status === 'Bathroom' && status === 'Present') {
        const startTime = bathroomTimers[index];
        if (startTime) {
            const endTime = new Date();
            const diffMs = endTime - startTime;
            const mins = Math.floor(diffMs / 60000);
            students[index].log.push(`[Returned from Bathroom after ${mins} min]`);
            delete bathroomTimers[index];
        }
    }
    students[index].status = status;
    students[index].log.push(`[${new Date().toLocaleString()}] -> ${status}`);
    saveCurrentState();
    renderStudents();
}

function setTeacher(index) {
    const teacherName = prompt("Enter teacher's name:");
    if (teacherName) {
        const now = new Date().toLocaleString();
        students[index].status = `${teacherName}`;
        students[index].log.push(`[${now}] -> Teacher: ${teacherName}`);
        saveCurrentState();
        renderStudents();
    }
}

function downloadLog() {
    let log = `Daily Attendance Log - ${currentPeriod} Period\n\n`;
    students.forEach(s => {
        log += `${s.name} - ${s.seat}\n`;
        s.log.forEach(entry => {
            log += `   ${entry}\n`;
        });
        log += '\n';
    });
    const blob = new Blob([log], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_log_${currentPeriod}.txt`;
    a.click();
}

function promptReset() {
    const pw = prompt("Enter password to reset all seats:");
    if (pw === "wenz2025") {
        students.forEach(s => {
            s.status = 'Not Checked In';
            s.log = [];
        });
        localStorage.removeItem(`attendance-${currentPeriod}`);
        saveCurrentState();
        renderStudents();
    } else {
        alert("Incorrect password.");
    }
}

window.onload = loadStudents;

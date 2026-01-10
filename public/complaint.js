// complaint.js
import { db } from './main.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Helper function to create your custom ID: YYYYMMDD-HHMMSS-0000
function generateCustomID() {
    const now = new Date();
    const date = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                 now.getDate().toString().padStart(2, '0');
    
    const time = now.getHours().toString().padStart(2, '0') + 
                 now.getMinutes().toString().padStart(2, '0') + 
                 now.getSeconds().toString().padStart(2, '0');
    
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `${date}-${time}-${random}`;
}

export async function handleComplaintSubmission() {
    // Select the button to control it
    const submitBtn = document.getElementById('submitBtn');
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const description = document.getElementById('description').value.trim();
    const email = document.getElementById('email').value;

    if (!name || !phone || !subject || !description) {
        alert("Please fill all fields before submitting.");
        return;
    }

    // --- DOUBLE-CLICK PROTECTION START ---
    submitBtn.disabled = true; // Makes the button unclickable
    submitBtn.innerText = "Submitting..."; // Visual feedback
    submitBtn.style.opacity = "0.6";
    // --- DOUBLE-CLICK PROTECTION END ---

    try {
        const uniqueCaseID = generateCustomID();
        const caseRef = ref(db, 'cases/' + uniqueCaseID);

        await set(caseRef, {
            caseId: uniqueCaseID,
            userName: name,
            userPhone: phone,
            userEmail: email,
            subject: subject,
            description: description,
            status: "Pending",
            timestamp: new Date().toLocaleString()
        });

        displaySuccessMessage(uniqueCaseID);
        
        // Keep button disabled but update text to show success
        submitBtn.innerText = "Submitted!";

    } catch (error) {
        console.error("Submission failed:", error);
        alert("Error saving complaint: " + error.message);
        
        // If it fails, re-enable the button so they can try again
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Complaint";
        submitBtn.style.opacity = "1";
    }
}

function displaySuccessMessage(id) {
    const statusContainer = document.getElementById('statusMessage');
    if(statusContainer) {
        statusContainer.innerHTML = `
            <div style="background: rgba(56, 189, 248, 0.2); padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #38bdf8; text-align: center;">
                <h3 style="color: #38bdf8; margin: 0;">Complaint Submitted!</h3>
                <p>Your Case ID is: <br><strong style="font-size: 1.1em; color: white;">${id}</strong></p>
                <p style="font-size: 0.85em; opacity: 0.8;">Save this ID to track your status.</p>
            </div>
        `;
    }
}
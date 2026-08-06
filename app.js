/**
 * CONFIGURATION - Filmcraft Institute Course & Google Sheet Integration
 * 
 * To connect your Google Sheet:
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Paste the Google Apps Script code provided in the instructions below
 * 3. Click "Deploy" -> "New deployment" -> Select "Web app" -> Set "Who has access" to "Anyone"
 * 4. Copy the Web App URL and paste it into `googleSheetWebhookUrl` below.
 */
const CONFIG = {
  instituteName: "Filmcraft Institute",
  courseName: "Cinematography & Video Editing Course",
  userEmail: "hk3g123@gmail.com",
  whatsappNumber: "+919336414677", // Target WhatsApp number (Include country code)
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbwQf82Fl5XEn8T31Zf8rIfSl_5L2Ouzw33_NuhurwYUl8hQjKaWFv4dXGnp7Q621ES9jA/exec",
  upiId: "filmcraftinstitute@upi",
  bankDetails: {
    accountHolder: "Harsh Kumar",
    bankName: "Bank of Baroda",
    accNumber: "08298100022610",
    ifsc: "BARB0BANDAX" // 5th letter is 0
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("registration-form");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const stepInd1 = document.getElementById("step-ind-1");
  const stepInd2 = document.getElementById("step-ind-2");

  const btnNext = document.getElementById("btn-next-step");
  const btnBack = document.getElementById("btn-back-step");
  const selectedMethodPill = document.getElementById("selected-method-pill");

  // File Upload Elements
  const dropzone = document.getElementById("dropzone");
  const screenshotInput = document.getElementById("screenshot-file");
  const dropzoneDefault = document.getElementById("dropzone-default");
  const dropzonePreview = document.getElementById("dropzone-preview");
  const previewImg = document.getElementById("preview-img");
  const previewFilename = document.getElementById("preview-filename");
  const btnRemoveFile = document.getElementById("btn-remove-file");

  // Radio Cards & Payment Method Switch
  const radioCards = document.querySelectorAll(".radio-card");
  const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
  const tabBtnUpi = document.getElementById("tab-btn-upi");
  const tabBtnBank = document.getElementById("tab-btn-bank");

  // Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Copy Buttons
  const copyBtns = document.querySelectorAll(".btn-copy");

  /* ==========================================
     1. Payment Method Selection Handling
     ========================================== */
  function getSelectedPaymentMethod() {
    const selected = document.querySelector('input[name="payment_method"]:checked');
    return selected ? selected.value : "Pay By QR ( UPI)";
  }

  paymentRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      radioCards.forEach(c => c.classList.remove("active"));
      const parentLabel = e.target.closest(".radio-card");
      if (parentLabel) parentLabel.classList.add("active");

      const methodVal = e.target.value;
      selectedMethodPill.innerHTML = `Method: <strong>${methodVal}</strong>`;

      // Auto switch right side panel tab
      if (methodVal.includes("Bank Transfer")) {
        tabBtnBank.click();
      } else {
        tabBtnUpi.click();
      }
    });
  });

  /* ==========================================
     2. Form Stepper & Input Validation
     ========================================== */
  function validateStep1() {
    let isValid = true;

    const fullName = document.getElementById("full-name");
    const mobile = document.getElementById("mobile");
    const address = document.getElementById("address");

    // Full Name
    if (!fullName.value.trim()) {
      showFieldError("full-name", true);
      isValid = false;
    } else {
      showFieldError("full-name", false);
    }

    // Mobile Number
    const phoneClean = mobile.value.replace(/\D/g, "");
    if (phoneClean.length < 10) {
      showFieldError("mobile", true);
      isValid = false;
    } else {
      showFieldError("mobile", false);
    }

    // Address
    if (!address.value.trim()) {
      showFieldError("address", true);
      isValid = false;
    } else {
      showFieldError("address", false);
    }

    return isValid;
  }

  function validateStep2() {
    let isValid = true;
    const txnId = document.getElementById("txn-id");

    if (!txnId.value.trim()) {
      showFieldError("txn-id", true);
      isValid = false;
    } else {
      showFieldError("txn-id", false);
    }

    if (!screenshotInput.files || screenshotInput.files.length === 0) {
      showFieldError("screenshot", true);
      isValid = false;
    } else {
      showFieldError("screenshot", false);
    }

    return isValid;
  }

  function showFieldError(fieldId, hasError) {
    let container;
    if (fieldId === "screenshot") {
      container = dropzone.parentElement;
    } else {
      const input = document.getElementById(fieldId);
      container = input ? input.closest(".input-group") : null;
    }

    if (container) {
      if (hasError) {
        container.classList.add("invalid");
      } else {
        container.classList.remove("invalid");
      }
    }
  }

  btnNext.addEventListener("click", () => {
    if (validateStep1()) {
      step1.classList.remove("active");
      step2.classList.add("active");
      stepInd1.classList.remove("active");
      stepInd1.classList.add("completed");
      stepInd2.classList.add("active");
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  });

  btnBack.addEventListener("click", () => {
    step2.classList.remove("active");
    step1.classList.add("active");
    stepInd2.classList.remove("active");
    stepInd1.classList.add("active");
  });

  /* ==========================================
     3. File Upload Drag & Drop Preview
     ========================================== */
  dropzone.addEventListener("click", (e) => {
    if (e.target !== btnRemoveFile && !btnRemoveFile.contains(e.target)) {
      screenshotInput.click();
    }
  });

  screenshotInput.addEventListener("change", handleFileSelect);

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      screenshotInput.files = files;
      handleFileSelect();
    }
  });

  function handleFileSelect() {
    const file = screenshotInput.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size exceeds 5MB limit", "error");
        removeSelectedFile();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewFilename.textContent = file.name;
        dropzoneDefault.classList.add("hidden");
        dropzonePreview.classList.remove("hidden");
        showFieldError("screenshot", false);
      };
      reader.readAsDataURL(file);
    }
  }

  btnRemoveFile.addEventListener("click", (e) => {
    e.stopPropagation();
    removeSelectedFile();
  });

  function removeSelectedFile() {
    screenshotInput.value = "";
    previewImg.src = "";
    previewFilename.textContent = "";
    dropzonePreview.classList.add("hidden");
    dropzoneDefault.classList.remove("hidden");
  }

  /* ==========================================
     4. Tab Switching Logic
     ========================================== */
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = document.getElementById(btn.getAttribute("data-tab"));
      if (targetTab) {
        targetTab.classList.add("active");
      }
    });
  });

  /* ==========================================
     5. Copy to Clipboard
     ========================================== */
  copyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied to clipboard: ${textToCopy}`);
      }).catch(() => {
        showToast("Failed to copy text", "error");
      });
    });
  });

  /* ==========================================
     6. Send Data to Google Sheet (Background Webhook)
     ========================================== */
  function sendToGoogleSheet(payload) {
    if (!CONFIG.googleSheetWebhookUrl || CONFIG.googleSheetWebhookUrl.trim() === "") {
      console.log("Google Sheet URL not configured yet. Skipping Sheet logging.");
      return Promise.resolve();
    }

    return fetch(CONFIG.googleSheetWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain" // "text/plain" avoids CORS preflight — works from GitHub Pages & any domain
      },
      body: JSON.stringify(payload)
    }).then(() => {
      console.log("Data successfully posted to Google Sheet webhook.");
    }).catch(err => {
      console.error("Error submitting to Google Sheet:", err);
    });
  }

  /* ==========================================
     7. Form Submission & WhatsApp Link Format
     ========================================== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      btnBack.click();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    // Collect Data
    const name = document.getElementById("full-name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const isExperienced = document.getElementById("student-experience").checked;
    const studentStatus = isExperienced ? "Experienced" : "Fresher";
    const paymentMethod = getSelectedPaymentMethod();
    const txnId = document.getElementById("txn-id").value.trim();
    const screenshotFile = screenshotInput.files[0];

    const submissionPayload = {
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      institute: CONFIG.instituteName,
      course: CONFIG.courseName,
      userEmail: CONFIG.userEmail,
      name: name,
      mobile: mobile,
      address: address,
      studentStatus: studentStatus,
      paymentMethod: paymentMethod,
      txnId: txnId,
      fileName: screenshotFile ? screenshotFile.name : "Attached via WhatsApp"
    };

    showToast("Saving to Google Sheet & launching WhatsApp...");

    // Send to Google Sheet in background
    sendToGoogleSheet(submissionPayload);

    // Format Structured WhatsApp Message
    const message =
      `🎬 *COURSE REGISTRATION & PAYMENT VERIFICATION*
----------------------------------------
🏫 *Institute:* ${CONFIG.instituteName}
📹 *Course:* ${CONFIG.courseName}
📧 *Google Account:* ${CONFIG.userEmail}

👤 *STUDENT DETAILS*
----------------------------------------
📌 *Your Name:* ${name}
📱 *Mobile No:* ${mobile}
🏠 *Address:* ${address}
🎓 *Student Status:* ${studentStatus}

💳 *PAYMENT INFORMATION*
----------------------------------------
💵 *Payment Method:* ${paymentMethod}
🔢 *Txn ID / UTR:* ${txnId}
👤 *Account Name:* ${CONFIG.bankDetails.accountHolder}
✅ *Status:* Payment Screenshot Attached

_Note: I am attaching my payment screenshot herewith for course registration verification._`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = CONFIG.whatsappNumber.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 800);
  });

  /* Helper: Toast Notifications */
  function showToast(msg) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #f59e0b;"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});

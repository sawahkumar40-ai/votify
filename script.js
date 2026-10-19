/* =====================================================
   VOTIFY - MAIN LOGIN SCRIPT
   ===================================================== */


/* =====================================================
   API
   ===================================================== */

const API_URL = "/api";


/* =====================================================
   ELEMENT
   ===================================================== */

const studentLogin =
    document.getElementById("studentLogin");

const adminLogin =
    document.getElementById("adminLogin");

const studentTab =
    document.getElementById("studentTab");

const adminTab =
    document.getElementById("adminTab");

const studentError =
    document.getElementById("studentError");

const adminError =
    document.getElementById("adminError");


/* =====================================================
   GANTI LOGIN SISWA / ADMIN
   ===================================================== */

function showLogin(type) {

    hideError(studentError);
    hideError(adminError);


    if (type === "student") {

        studentLogin.classList.add("active");
        adminLogin.classList.remove("active");

        studentTab.classList.add("active");
        adminTab.classList.remove("active");


        const input =
            document.getElementById(
                "studentCode"
            );

        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }

    }


    else if (type === "admin") {

        adminLogin.classList.add("active");
        studentLogin.classList.remove("active");

        adminTab.classList.add("active");
        studentTab.classList.remove("active");


        const input =
            document.getElementById(
                "adminUsername"
            );

        if (input) {
            setTimeout(() => {
                input.focus();
            }, 100);
        }

    }

}


/* =====================================================
   LOGIN SISWA
   ===================================================== */

async function loginStudent(event) {

    event.preventDefault();


    hideError(studentError);


    const studentCodeInput =
        document.getElementById(
            "studentCode"
        );

    const studentTokenInput =
        document.getElementById(
            "studentToken"
        );


    if (
        !studentCodeInput ||
        !studentTokenInput
    ) {

        showError(
            studentError,
            "Form login siswa tidak ditemukan."
        );

        return;

    }


    const studentCode =
        studentCodeInput.value
            .trim()
            .toUpperCase();


    const token =
        studentTokenInput.value
            .trim()
            .toUpperCase();


    /* ==============================================
       VALIDASI
    ============================================== */

    if (!studentCode) {

        showError(
            studentError,
            "Masukkan ID Siswa."
        );

        studentCodeInput.focus();

        return;

    }


    if (!token) {

        showError(
            studentError,
            "Masukkan Token."
        );

        studentTokenInput.focus();

        return;

    }


    /* ==============================================
       BUTTON
    ============================================== */

    const button =
        document.querySelector(
            "#studentForm .login-button"
        );


    const originalText =
        button
            ? button.textContent
            : "Login";


    if (button) {

        button.disabled = true;

        button.textContent =
            "Memeriksa...";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/login/student`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        studentCode:
                            studentCode,

                        token:
                            token

                    })

                }
            );


        const data =
            await response.json();


        /* ==========================================
           LOGIN GAGAL
        =========================================== */

        if (!response.ok) {

            showError(
                studentError,
                data.message ||
                "ID Siswa atau Token salah."
            );

            return;

        }


        /* ==========================================
           SIMPAN DATA SISWA
        =========================================== */

        localStorage.setItem(
            "votify_current_student",
            JSON.stringify(
                data.student
            )
        );


        /* ==========================================
           PINDAH KE HALAMAN VOTING
        =========================================== */

        window.location.href =
            "public/index.html";

    }


    catch (error) {

        console.error(
            "Login siswa error:",
            error
        );


        showError(
            studentError,
            "Tidak dapat terhubung ke server."
        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}


/* =====================================================
   LOGIN ADMIN
   ===================================================== */

async function loginAdmin(event) {

    event.preventDefault();


    hideError(adminError);


    const usernameInput =
        document.getElementById(
            "adminUsername"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );


    if (
        !usernameInput ||
        !passwordInput
    ) {

        showError(
            adminError,
            "Form login admin tidak ditemukan."
        );

        return;

    }


    const username =
        usernameInput.value.trim();


    const password =
        passwordInput.value;


    /* ==============================================
       VALIDASI
    ============================================== */

    if (!username) {

        showError(
            adminError,
            "Masukkan username."
        );

        usernameInput.focus();

        return;

    }


    if (!password) {

        showError(
            adminError,
            "Masukkan password."
        );

        passwordInput.focus();

        return;

    }


    /* ==============================================
       BUTTON
    ============================================== */

    const button =
        document.querySelector(
            "#adminForm .login-button"
        );


    const originalText =
        button
            ? button.textContent
            : "Login";


    if (button) {

        button.disabled = true;

        button.textContent =
            "Memeriksa...";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/login/admin`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        username:
                            username,

                        password:
                            password

                    })

                }
            );


        const data =
            await response.json();


        /* ==========================================
           LOGIN GAGAL
        =========================================== */

        if (!response.ok) {

            showError(
                adminError,
                data.message ||
                "Username atau password salah."
            );

            return;

        }


        /* ==========================================
           SIMPAN DATA ADMIN
        =========================================== */

        localStorage.setItem(
            "votify_admin",
            JSON.stringify(
                data.admin
            )
        );


        /* ==========================================
           MASUK DASHBOARD
        =========================================== */

        window.location.href =
            "admin/index.html";

    }


    catch (error) {

        console.error(
            "Login admin error:",
            error
        );


        showError(
            adminError,
            "Tidak dapat terhubung ke server."
        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}


/* =====================================================
   SHOW ERROR
   ===================================================== */

function showError(
    element,
    message
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );

}


/* =====================================================
   HIDE ERROR
   ===================================================== */

function hideError(
    element
) {

    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.classList.remove(
        "show"
    );

}


/* =====================================================
   ENTER KEY
   ===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter"
        ) {
            return;
        }


        /* Login siswa sedang aktif */

        if (
            studentLogin &&
            studentLogin.classList.contains(
                "active"
            )
        ) {

            const form =
                document.getElementById(
                    "studentForm"
                );

            if (form) {
                form.requestSubmit();
            }

        }


        /* Login admin sedang aktif */

        else if (
            adminLogin &&
            adminLogin.classList.contains(
                "active"
            )
        ) {

            const form =
                document.getElementById(
                    "adminForm"
                );

            if (form) {
                form.requestSubmit();
            }

        }

    }
);


/* =====================================================
   SERVER CHECK
   ===================================================== */

async function checkServer() {

    try {

        const response =
            await fetch(
                API_URL
            );


        if (!response.ok) {

            throw new Error(
                "Server tidak merespons."
            );

        }


        console.log(
            "Votify server terhubung."
        );

    }


    catch (error) {

        console.warn(
            "Server Votify belum terhubung.",
            error
        );

    }

}


/* =====================================================
   SAAT HALAMAN SELESAI DIMUAT
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Default: login siswa */

        showLogin("student");


        /* Cek server */

        checkServer();

    }
);
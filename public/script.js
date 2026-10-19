// ==========================================
// VOTIFY - STUDENT VOTING SCRIPT
// ==========================================

let currentStudent = null;
let candidates = [];
let selectedCandidate = null;


// ==========================================
// SAAT HALAMAN DIBUKA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStudent();

    }
);


// ==========================================
// LOAD DATA SISWA
// ==========================================

function loadStudent() {

    const savedStudent =
        localStorage.getItem(
            "votify_current_student"
        );


    if (!savedStudent) {

        window.location.href =
            "../index.html";

        return;

    }


    try {

        currentStudent =
            JSON.parse(
                savedStudent
            );

    } catch (error) {

        localStorage.removeItem(
            "votify_current_student"
        );

        window.location.href =
            "../index.html";

        return;

    }


    // Tampilkan data siswa

    setText(
        "studentName",
        currentStudent.name
    );

    setText(
        "studentNisn",
        currentStudent.nisn
    );

    setText(
        "studentClass",
        currentStudent.class_name
    );


    // Ambil Paslon

    loadCandidates();

}


// ==========================================
// LOAD PASLON
// ==========================================

async function loadCandidates() {

    const container =
        document.getElementById(
            "candidatesList"
        );


    try {

        const response =
            await fetch(
                "/api/candidates"
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data Paslon."
            );

        }


        candidates =
            result.data || [];


        renderCandidates();


    } catch (error) {

        console.error(
            "Load candidates error:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="loading">

                    Gagal memuat Paslon.

                    <br>

                    Silakan refresh halaman.

                </div>

            `;

        }

    }

}


// ==========================================
// RENDER PASLON
// ==========================================

function renderCandidates() {

    const container =
        document.getElementById(
            "candidatesList"
        );


    if (!container) {
        return;
    }


    if (candidates.length === 0) {

        container.innerHTML = `

            <div class="loading">

                Belum ada Paslon yang tersedia.

            </div>

        `;

        return;

    }


    let html = "";


    candidates.forEach(
        candidate => {

            const image =
                candidate.image;


            html += `

                <div
                    class="candidate-card"
                    data-id="${candidate.id}"
                    onclick="selectCandidate(${candidate.id})"
                >

                    <div class="candidate-image">

                        ${
                            image

                            ? `

                                <img
                                    src="${escapeAttribute(image)}"
                                    alt="Foto Paslon ${candidate.number}"
                                >

                            `

                            : `

                                <div class="candidate-no-image">

                                    Foto belum tersedia

                                </div>

                            `
                        }

                    </div>


                    <div class="candidate-info">

                        <div class="candidate-number">

                            PASLON
                            ${candidate.number}

                        </div>


                        <h3>

                            ${escapeHtml(
                                candidate.name
                            )}

                        </h3>


                        <p>

                            Wakil:

                            ${escapeHtml(
                                candidate.vice_name
                            )}

                        </p>


                        <div class="candidate-select">

                            <input
                                type="radio"
                                name="candidate"
                                value="${candidate.id}"
                                onclick="event.stopPropagation(); selectCandidate(${candidate.id})"
                            >

                            <span>
                                Pilih Paslon ini
                            </span>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ==========================================
// PILIH PASLON
// ==========================================

function selectCandidate(id) {

    const candidate =
        candidates.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!candidate) {
        return;
    }


    selectedCandidate =
        candidate;


    // Hapus selected dari semua card

    document
        .querySelectorAll(
            ".candidate-card"
        )
        .forEach(
            card => {

                card.classList.remove(
                    "selected"
                );

            }
        );


    // Tambahkan selected

    const selectedCard =
        document.querySelector(
            `.candidate-card[data-id="${id}"]`
        );


    if (selectedCard) {

        selectedCard.classList.add(
            "selected"
        );

    }


    // Radio button

    const radio =
        document.querySelector(
            `.candidate-card[data-id="${id}"] input[type="radio"]`
        );


    if (radio) {

        radio.checked =
            true;

    }


    // Aktifkan tombol voting

    const voteButton =
        document.getElementById(
            "voteButton"
        );


    if (voteButton) {

        voteButton.disabled =
            false;

        voteButton.textContent =
            `Vote Paslon ${candidate.number}`;

    }

}


// ==========================================
// BUKA KONFIRMASI
// ==========================================

function submitVote() {

    if (!selectedCandidate) {

        showMessage(
            "Pilih Paslon terlebih dahulu.",
            "error"
        );

        return;

    }


    const selected =
        document.getElementById(
            "selectedCandidate"
        );


    if (selected) {

        selected.innerHTML = `

            Paslon ${selectedCandidate.number}

            <br>

            ${escapeHtml(
                selectedCandidate.name
            )}

            &

            ${escapeHtml(
                selectedCandidate.vice_name
            )}

        `;

    }


    const modal =
        document.getElementById(
            "confirmModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// ==========================================
// TUTUP KONFIRMASI
// ==========================================

function closeConfirmModal() {

    const modal =
        document.getElementById(
            "confirmModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ==========================================
// KONFIRMASI VOTE
// ==========================================

async function confirmVote() {

    if (
        !currentStudent ||
        !selectedCandidate
    ) {

        return;

    }


    const confirmButton =
        document.querySelector(
            ".confirm-button"
        );


    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "Mengirim...";

    }


    try {

        const response =
            await fetch(
                "/api/vote",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            studentId:
                                currentStudent.id,

                            candidateId:
                                selectedCandidate.id

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            showMessage(
                result.message ||
                "Gagal menyimpan suara.",
                "error"
            );

            return;

        }


        // Tutup modal

        closeConfirmModal();


        // Update local data

        currentStudent.has_voted =
            1;


        localStorage.setItem(
            "votify_current_student",
            JSON.stringify(
                currentStudent
            )
        );


        // Tampilkan berhasil

        showMessage(
            "Suara berhasil dikirim. Terima kasih sudah memilih!",
            "success"
        );


        // Nonaktifkan voting

        disableVoting();


    } catch (error) {

        console.error(
            "Vote error:",
            error
        );


        showMessage(
            "Tidak dapat terhubung ke server.",
            "error"
        );

    } finally {

        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Ya, Kirim Suara";

        }

    }

}


// ==========================================
// NONAKTIFKAN VOTING
// ==========================================

function disableVoting() {

    document
        .querySelectorAll(
            ".candidate-card"
        )
        .forEach(
            card => {

                card.style.pointerEvents =
                    "none";

            }
        );


    const voteButton =
        document.getElementById(
            "voteButton"
        );


    if (voteButton) {

        voteButton.disabled =
            true;

        voteButton.textContent =
            "Suara Sudah Dikirim";

    }

}


// ==========================================
// PESAN
// ==========================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "message show " +
        type;


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ==========================================
// LOGOUT SISWA
// ==========================================

function logoutStudent() {

    localStorage.removeItem(
        "votify_current_student"
    );


    window.location.href =
        "../index.html";

}


// ==========================================
// HELPER
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "-";

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// ESCAPE ATTRIBUTE
// ==========================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


// ==========================================
// KLIK DI LUAR MODAL
// ==========================================

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "confirmModal"
            );


        if (
            event.target ===
            modal
        ) {

            closeConfirmModal();

        }

    }
);
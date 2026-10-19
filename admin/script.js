let students = [];
let candidates = [];
let results = [];
let voteChart = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const adminSession =
            localStorage.getItem(
                "votify_admin"
            );


        if (!adminSession) {

            window.location.href =
                "../index.html";

            return;

        }


        loadAllData();

    }
);



async function loadAllData() {

    await Promise.all([

        loadStudents(),
        loadCandidates(),
        loadResults()

    ]);


    updateDashboard();

}



function showSection(section) {

    const sections = [

        "dashboard",
        "students",
        "candidates",
        "results"

    ];


    sections.forEach(
        name => {

            const element =
                document.getElementById(
                    name +
                    "Section"
                );


            if (element) {

                element.classList.toggle(
                    "active",
                    name === section
                );

            }

        }
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    const index =
        sections.indexOf(
            section
        );


    if (buttons[index]) {

        buttons[index].classList.add(
            "active"
        );

    }


    const titles = {

        dashboard:
            "Dashboard",

        students:
            "Data Siswa",

        candidates:
            "Paslon",

        results:
            "Hasil Voting"

    };


    const title =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            titles[section] ||
            "Dashboard";

    }


    if (
        section ===
        "students"
    ) {

        loadStudents();

    }


    if (
        section ===
        "candidates"
    ) {

        loadCandidates();

    }


    if (
        section ===
        "results"
    ) {

        loadResults();

    }

}



/* =========================
   STUDENTS
========================= */


async function loadStudents() {

    try {

        const response =
            await fetch(
                "/api/students"
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data siswa."
            );

        }


        students =
            result.data ||
            [];


        renderStudents();

        updateDashboard();


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        const container =
            document.getElementById(
                "studentsList"
            );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    Gagal memuat data siswa.

                </div>

            `;

        }

    }

}



function renderStudents() {

    const container =
        document.getElementById(
            "studentsList"
        );


    if (!container) {
        return;
    }


    if (
        students.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Belum ada data siswa.

            </div>

        `;

        return;

    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>
                        No
                    </th>

                    <th>
                        Nama
                    </th>

                    <th>
                        ID Siswa
                    </th>

                    <th>
                        Kelas
                    </th>

                    <th>
                        Token
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Aksi
                    </th>

                </tr>

            </thead>


            <tbody>

    `;


    students.forEach(
        (student, index) => {

            const voted =
                Number(
                    student.has_voted
                ) === 1;


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>
                        ${escapeHtml(
                            student.name
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            student.student_code
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            student.class_name
                        )}
                    </td>


                    <td>

                        <button
                            class="token-button"
                            onclick="copyToken('${escapeAttribute(student.token)}')"
                        >

                            ${escapeHtml(
                                student.token
                            )}

                        </button>

                    </td>


                    <td>

                        ${
                            voted

                                ? `

                                    <span
                                        class="status voted"
                                    >
                                        Sudah Voting
                                    </span>

                                `

                                : `

                                    <span
                                        class="status not-voted"
                                    >
                                        Belum Voting
                                    </span>

                                `
                        }

                    </td>


                    <td>

                        ${
                            voted

                                ? `

                                    <button
                                        class="delete-button disabled"
                                        disabled
                                    >
                                        Hapus
                                    </button>

                                `

                                : `

                                    <button
                                        class="delete-button"
                                        onclick="deleteStudent(${student.id})"
                                    >
                                        Hapus
                                    </button>

                                `
                        }

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;

}



/* =========================
   CETAK SISWA
========================= */


function printStudents() {

    if (
        students.length === 0
    ) {

        alert(
            "Belum ada data siswa untuk dicetak."
        );

        return;

    }


    let rows = "";


    students.forEach(
        (student, index) => {

            const status =
                Number(
                    student.has_voted
                ) === 1

                    ? "Sudah Voting"

                    : "Belum Voting";


            rows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.student_code
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.class_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.token
                        )}
                    </td>

                    <td>
                        ${status}
                    </td>

                </tr>

            `;

        }
    );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup diblokir browser. Izinkan popup untuk mencetak."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Data Siswa Votify
            </title>


            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:
                        30px;

                    color:
                        #111;

                }


                h1 {

                    text-align:
                        center;

                    margin-bottom:
                        5px;

                }


                p {

                    text-align:
                        center;

                    color:
                        #555;

                }


                table {

                    width:
                        100%;

                    border-collapse:
                        collapse;

                    margin-top:
                        25px;

                }


                th,
                td {

                    border:
                        1px solid #333;

                    padding:
                        8px;

                    font-size:
                        13px;

                    text-align:
                        left;

                }


                th {

                    background:
                        #eee;

                }


                .footer {

                    margin-top:
                        20px;

                    font-size:
                        12px;

                }


                @media print {

                    body {

                        padding:
                            0;

                    }

                }

            </style>

        </head>


        <body>

            <h1>
                DATA SISWA VOTIFY
            </h1>


            <p>
                Daftar Peserta Voting
            </p>


            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Nama
                        </th>

                        <th>
                            ID Siswa
                        </th>

                        <th>
                            Kelas
                        </th>

                        <th>
                            Token
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="footer">

                Total siswa:
                ${students.length}

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(
        () => {

            printWindow.print();

        },
        300
    );

}



/* =========================
   MODAL SISWA
========================= */


function openStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}



function closeStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.reset();

    }

}



/* =========================
   TAMBAH SISWA
========================= */


async function addStudent(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "studentName"
        ).value.trim();


    const className =
        document.getElementById(
            "studentClass"
        ).value;


    if (
        !name ||
        !className
    ) {

        alert(
            "Nama dan kelas wajib diisi."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/students",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            name:
                                name,

                            className:
                                className

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Gagal menambahkan siswa."
            );

            return;

        }


        alert(

            "Siswa berhasil ditambahkan.\n\n" +

            "ID Siswa: " +
            result.data.student_code +

            "\n" +

            "Token: " +
            result.data.token

        );


        closeStudentModal();


        await loadStudents();


    } catch (error) {

        console.error(
            "Add student error:",
            error
        );


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}



/* =========================
   HAPUS SISWA
========================= */


async function deleteStudent(id) {

    const student =
        students.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!student) {
        return;
    }


    const confirmDelete =
        confirm(

            `Hapus siswa "${student.name}"?`

        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/students/${id}`,
                {

                    method:
                        "DELETE"

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Gagal menghapus siswa."
            );

            return;

        }


        alert(
            "Siswa berhasil dihapus."
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}



/* =========================
   COPY TOKEN
========================= */


async function copyToken(token) {

    try {

        await navigator.clipboard.writeText(
            token
        );


        alert(
            "Token berhasil disalin: " +
            token
        );


    } catch (error) {

        alert(
            "Token: " +
            token
        );

    }

}



/* =========================
   PASLON
========================= */


async function loadCandidates() {

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
            result.data ||
            [];


        renderCandidates();

        updateDashboard();


    } catch (error) {

        console.error(
            "Load candidates error:",
            error
        );


        const container =
            document.getElementById(
                "candidatesList"
            );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    Gagal memuat data Paslon.

                </div>

            `;

        }

    }

}



function renderCandidates() {

    const container =
        document.getElementById(
            "candidatesList"
        );


    if (!container) {
        return;
    }


    if (
        candidates.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Belum ada Paslon.

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
                    class="candidate-admin-card"
                >


                    <div
                        class="candidate-admin-image"
                    >

                        ${
                            image

                                ? `

                                    <img
                                        src="${escapeAttribute(image)}"
                                        alt="Paslon ${candidate.number}"
                                    >

                                `

                                : `

                                    <div class="no-image">
                                        Tidak ada foto
                                    </div>

                                `
                        }

                    </div>


                    <div
                        class="candidate-admin-info"
                    >

                        <div
                            class="candidate-number"
                        >

                            Paslon
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


                        <div
                            class="candidate-actions"
                        >


                            <button
                                class="secondary-button"
                                onclick="editCandidate(${candidate.id})"
                            >
                                Edit
                            </button>


                            <button
                                class="delete-button"
                                onclick="deleteCandidate(${candidate.id})"
                            >
                                Hapus
                            </button>


                        </div>


                    </div>


                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}



function openCandidateModal() {

    const modal =
        document.getElementById(
            "candidateModal"
        );


    if (!modal) {
        return;
    }


    document.getElementById(
        "candidateModalTitle"
    ).textContent =
        "Tambah Paslon";


    document.getElementById(
        "candidateId"
    ).value =
        "";


    document.getElementById(
        "candidateNumber"
    ).value =
        "";


    document.getElementById(
        "candidateName"
    ).value =
        "";


    document.getElementById(
        "candidateVice"
    ).value =
        "";


    document.getElementById(
        "candidateImage"
    ).value =
        "";


    document.getElementById(
        "candidateImagePreview"
    ).innerHTML =
        "";


    modal.classList.add(
        "show"
    );

}



function closeCandidateModal() {

    const modal =
        document.getElementById(
            "candidateModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}



function previewCandidateImage(event) {

    const file =
        event.target.files[0];


    const preview =
        document.getElementById(
            "candidateImagePreview"
        );


    if (!preview) {
        return;
    }


    if (!file) {

        preview.innerHTML =
            "";

        return;

    }


    if (
        ![
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(
            file.type
        )
    ) {

        alert(
            "Format foto harus JPG, PNG atau WEBP."
        );


        event.target.value =
            "";


        preview.innerHTML =
            "";

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Ukuran foto maksimal 5 MB."
        );


        event.target.value =
            "";


        preview.innerHTML =
            "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            preview.innerHTML = `

                <img
                    src="${reader.result}"
                    alt="Preview foto Paslon"
                >

            `;

        };


    reader.readAsDataURL(
        file
    );

}



function editCandidate(id) {

    const candidate =
        candidates.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!candidate) {
        return;
    }


    document.getElementById(
        "candidateModalTitle"
    ).textContent =
        "Edit Paslon";


    document.getElementById(
        "candidateId"
    ).value =
        candidate.id;


    document.getElementById(
        "candidateNumber"
    ).value =
        candidate.number;


    document.getElementById(
        "candidateName"
    ).value =
        candidate.name;


    document.getElementById(
        "candidateVice"
    ).value =
        candidate.vice_name;


    document.getElementById(
        "candidateImage"
    ).value =
        "";


    const preview =
        document.getElementById(
            "candidateImagePreview"
        );


    if (preview) {

        if (
            candidate.image
        ) {

            preview.innerHTML = `

                <div
                    class="current-image-label"
                >
                    Foto saat ini
                </div>


                <img
                    src="${escapeAttribute(candidate.image)}"
                    alt="Foto Paslon"
                >

            `;

        } else {

            preview.innerHTML = `

                <div class="no-image">
                    Belum ada foto
                </div>

            `;

        }

    }


    document
        .getElementById(
            "candidateModal"
        )
        .classList.add(
            "show"
        );

}



async function saveCandidate(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "candidateId"
        ).value;


    const number =
        document.getElementById(
            "candidateNumber"
        ).value.trim();


    const name =
        document.getElementById(
            "candidateName"
        ).value.trim();


    const viceName =
        document.getElementById(
            "candidateVice"
        ).value.trim();


    const imageInput =
        document.getElementById(
            "candidateImage"
        );


    const imageFile =
        imageInput.files[0];


    if (
        !number ||
        !name ||
        !viceName
    ) {

        alert(
            "Nomor, nama ketua, dan nama wakil wajib diisi."
        );

        return;

    }


    if (
        imageFile &&
        imageFile.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Ukuran foto maksimal 5 MB."
        );

        return;

    }


    const formData =
        new FormData();


    formData.append(
        "number",
        number
    );


    formData.append(
        "name",
        name
    );


    formData.append(
        "viceName",
        viceName
    );


    if (imageFile) {

        formData.append(
            "image",
            imageFile
        );

    }


    try {

        let url =
            "/api/candidates";


        let method =
            "POST";


        if (id) {

            url =
                `/api/candidates/${id}`;

            method =
                "PUT";

        }


        const response =
            await fetch(
                url,
                {

                    method:
                        method,

                    body:
                        formData

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Gagal menyimpan Paslon."
            );

            return;

        }


        alert(

            id

                ? "Paslon berhasil diperbarui."

                : "Paslon berhasil ditambahkan."

        );


        closeCandidateModal();


        await loadCandidates();

        await loadResults();

        updateDashboard();


    } catch (error) {

        console.error(
            "Save candidate error:",
            error
        );


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}



async function deleteCandidate(id) {

    const candidate =
        candidates.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!candidate) {
        return;
    }


    const confirmDelete =
        confirm(

            `Hapus Paslon nomor ${candidate.number}?\n\n` +
            `${candidate.name} & ${candidate.vice_name}`

        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/candidates/${id}`,
                {

                    method:
                        "DELETE"

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Gagal menghapus Paslon."
            );

            return;

        }


        alert(
            "Paslon berhasil dihapus."
        );


        await loadCandidates();

        await loadResults();

        updateDashboard();


    } catch (error) {

        console.error(
            "Delete candidate error:",
            error
        );


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}



/* =========================
   HASIL
========================= */


async function loadResults() {

    try {

        const response =
            await fetch(
                "/api/results"
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil hasil voting."
            );

        }


        results =
            result.data ||
            [];


        renderResults();

        updateChart();

        updateDashboard();


    } catch (error) {

        console.error(
            "Load results error:",
            error
        );

    }

}



function renderResults() {

    const container =
        document.getElementById(
            "resultsList"
        );


    if (!container) {
        return;
    }


    if (
        results.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Belum ada hasil voting.

            </div>

        `;

        return;

    }


    let html = "";


    results.forEach(
        candidate => {

            html += `

                <div class="result-card">

                    <div>

                        <strong>

                            Paslon
                            ${candidate.number}

                        </strong>


                        <span>

                            ${escapeHtml(
                                candidate.name
                            )}

                            &

                            ${escapeHtml(
                                candidate.vice_name
                            )}

                        </span>

                    </div>


                    <strong>

                        ${candidate.vote_count}
                        suara

                    </strong>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}



/* =========================
   DASHBOARD
========================= */


function updateDashboard() {

    const totalStudents =
        students.length;


    const totalVoted =
        students.filter(
            student =>
                Number(
                    student.has_voted
                ) === 1
        ).length;


    const totalNotVoted =
        totalStudents -
        totalVoted;


    const totalCandidates =
        candidates.length;


    setText(
        "totalStudents",
        totalStudents
    );


    setText(
        "totalVoted",
        totalVoted
    );


    setText(
        "totalNotVoted",
        totalNotVoted
    );


    setText(
        "totalCandidates",
        totalCandidates
    );

}



/* =========================
   CHART
========================= */


function updateChart() {

    const canvas =
        document.getElementById(
            "voteChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const labels =
        results.map(
            candidate =>
                "Paslon " +
                candidate.number
        );


    const data =
        results.map(
            candidate =>
                Number(
                    candidate.vote_count
                )
        );


    if (voteChart) {

        voteChart.destroy();

    }


    voteChart =
        new Chart(
            canvas,
            {

                type:
                    "doughnut",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            data:
                                data

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}



/* =========================
   RESET
========================= */


async function resetVoting() {

    const confirmed =
        confirm(

            "Yakin ingin mereset semua data voting?\n\n" +
            "Semua suara akan dihapus dan status siswa akan kembali menjadi belum voting."

        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/reset",
                {

                    method:
                        "POST"

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Gagal mereset voting."
            );

            return;

        }


        alert(
            "Voting berhasil direset."
        );


        await loadAllData();


    } catch (error) {

        console.error(
            "Reset error:",
            error
        );


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}



/* =========================
   CETAK HASIL
========================= */

function printResults() {

    window.print();

}



/* =========================
   LOGOUT
========================= */

function logout() {

    localStorage.removeItem(
        "votify_admin"
    );


    window.location.href =
        "../index.html";

}



/* =========================
   HELPER
========================= */

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
            value;

    }

}



function escapeHtml(value) {

    return String(
        value ?? ""
    )

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



function escapeAttribute(value) {

    return String(
        value ?? ""
    )

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



/* =========================
   KLIK LUAR MODAL
========================= */

window.addEventListener(
    "click",
    event => {

        const studentModal =
            document.getElementById(
                "studentModal"
            );


        const candidateModal =
            document.getElementById(
                "candidateModal"
            );


        if (
            event.target ===
            studentModal
        ) {

            closeStudentModal();

        }


        if (
            event.target ===
            candidateModal
        ) {

            closeCandidateModal();

        }

    }
);
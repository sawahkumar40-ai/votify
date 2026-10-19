const Database = require("better-sqlite3");
const path = require("path");

const dbPath =
    path.join(
        __dirname,
        "votify.db"
    );

const db =
    new Database(dbPath);

db.pragma(
    "foreign_keys = ON"
);


/* =========================
   TABLE STUDENTS
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nisn TEXT NOT NULL UNIQUE,
        class_name TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        has_voted INTEGER NOT NULL DEFAULT 0,
        student_code TEXT UNIQUE
    )
`).run();


/* =========================
   MIGRASI STUDENT CODE
========================= */

const studentColumns =
    db.prepare(`
        PRAGMA table_info(students)
    `).all();


const hasStudentCodeColumn =
    studentColumns.some(
        column =>
            column.name ===
            "student_code"
    );


if (!hasStudentCodeColumn) {

    db.prepare(`
        ALTER TABLE students
        ADD COLUMN student_code TEXT
    `).run();

    console.log(
        "Kolom student_code berhasil ditambahkan."
    );

}


/* =========================
   ISI ID UNTUK DATA LAMA
========================= */

const studentsWithoutCode =
    db.prepare(`
        SELECT id
        FROM students
        WHERE student_code IS NULL
        ORDER BY id ASC
    `).all();


const updateStudentCode =
    db.prepare(`
        UPDATE students
        SET student_code = ?
        WHERE id = ?
    `);


for (
    const student
    of studentsWithoutCode
) {

    const code =
        "VTF" +
        String(
            student.id
        ).padStart(
            3,
            "0"
        );


    updateStudentCode.run(
        code,
        student.id
    );

}


/* =========================
   TABLE CANDIDATES
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        vice_name TEXT NOT NULL,
        image TEXT
    )
`).run();


/* =========================
   MIGRASI FOTO
========================= */

const candidateColumns =
    db.prepare(`
        PRAGMA table_info(candidates)
    `).all();


const hasImageColumn =
    candidateColumns.some(
        column =>
            column.name ===
            "image"
    );


if (!hasImageColumn) {

    db.prepare(`
        ALTER TABLE candidates
        ADD COLUMN image TEXT
    `).run();

    console.log(
        "Kolom image berhasil ditambahkan ke candidates."
    );

}


/* =========================
   TABLE VOTES
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL UNIQUE,
        candidate_id INTEGER NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
            REFERENCES students(id)
            ON DELETE CASCADE,

        FOREIGN KEY (candidate_id)
            REFERENCES candidates(id)
            ON DELETE CASCADE
    )
`).run();


/* =========================
   TABLE ADMINS
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`).run();


/* =========================
   DATA AWAL PASLON
========================= */

const candidateCount =
    db.prepare(`
        SELECT COUNT(*) AS count
        FROM candidates
    `).get().count;


if (
    candidateCount === 0
) {

    const insertCandidate =
        db.prepare(`
            INSERT INTO candidates
            (
                number,
                name,
                vice_name,
                image
            )
            VALUES (?, ?, ?, ?)
        `);


    insertCandidate.run(
        1,
        "Ahmad Rizky",
        "Maya",
        null
    );


    insertCandidate.run(
        2,
        "Bintang Putra",
        "Sarah",
        null
    );

}


/* =========================
   ADMIN DEFAULT
========================= */

const adminCount =
    db.prepare(`
        SELECT COUNT(*) AS count
        FROM admins
    `).get().count;


if (
    adminCount === 0
) {

    db.prepare(`
        INSERT INTO admins
        (
            username,
            password
        )
        VALUES (?, ?)
    `).run(
        "admin",
        "Admin_123"
    );

}


/* =========================
   UPDATE PASSWORD ADMIN
   (JALANKAN SEKALI)
========================= */

db.prepare(`
    UPDATE admins
    SET password = ?
    WHERE username = ?
`).run(
    "Admin_123",
    "admin"
);


/* =========================
   DATA AWAL SISWA
========================= */

const studentCount =
    db.prepare(`
        SELECT COUNT(*) AS count
        FROM students
    `).get().count;


if (
    studentCount === 0
) {

    const students = [

        [
            "Siswa A",
            "12345678",
            "XII TKJ",
            "SISWA01",
            "VTF001"
        ],

        [
            "Siswa B",
            "12345679",
            "XII TKJ",
            "SISWA02",
            "VTF002"
        ],

        [
            "Siswa C",
            "12345680",
            "XII TKJ",
            "SISWA03",
            "VTF003"
        ],

        [
            "Siswa D",
            "12345681",
            "XII TKJ",
            "SISWA04",
            "VTF004"
        ],

        [
            "Siswa E",
            "12345682",
            "XII TKJ",
            "SISWA05",
            "VTF005"
        ]

    ];


    const insertStudent =
        db.prepare(`
            INSERT INTO students
            (
                name,
                nisn,
                class_name,
                token,
                student_code
            )
            VALUES (?, ?, ?, ?, ?)
        `);


    const insertMany =
        db.transaction(
            data => {

                for (
                    const student
                    of data
                ) {

                    insertStudent.run(
                        ...student
                    );

                }

            }
        );


    insertMany(
        students
    );

}


console.log(
    "Database Votify berhasil terhubung."
);


console.log(
    `Lokasi database: ${dbPath}`
);


module.exports = db;
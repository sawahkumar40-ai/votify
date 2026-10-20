const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db =
    require("./database");

const app =
    express();

const PORT =
    3333;


/* =========================
   FOLDER UPLOAD
========================= */

const uploadDirectory =
    path.join(
        __dirname,
        "..",
        "uploads",
        "candidates"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


/* =========================
   MULTER
========================= */

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDirectory
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    );


                const filename =
                    "candidate-" +
                    Date.now() +
                    extension;


                cb(
                    null,
                    filename
                );

            }

    });


const upload =
    multer({

        storage:
            storage,

        limits: {

            fileSize:
                5 * 1024 * 1024

        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const allowedTypes = [

                    "image/jpeg",
                    "image/png",
                    "image/webp"

                ];


                if (
                    allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Format gambar harus JPG, PNG, atau WEBP."
                        )
                    );

                }

            }

    });


/* =========================
   MIDDLEWARE
========================= */

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    express.static(
        path.join(
            __dirname,
            ".."
        )
    )
);


app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "..",
            "uploads"
        )
    )
);


/* =========================
   TEST API
========================= */

app.get(
    "/api",
    (req, res) => {

        res.json({

            success:
                true,

            message:
                "Votify API berjalan!"

        });

    }
);


/* =========================
   DATA SISWA
========================= */

app.get(
    "/api/students",
    (req, res) => {

        try {

            const students =
                db.prepare(`
                    SELECT
                        id,
                        student_code,
                        name,
                        class_name,
                        token,
                        has_voted
                    FROM students
                    ORDER BY id ASC
                `).all();


            res.json({

                success:
                    true,

                data:
                    students

            });


        } catch (error) {

            console.error(
                "Students error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal mengambil data siswa."

            });

        }

    }
);


/* =========================
   TAMBAH SISWA
========================= */

app.post(
    "/api/students",
    (req, res) => {

        try {

            const {
                name,
                className
            } = req.body;


            if (
                !name ||
                !className
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Nama dan kelas wajib diisi."

                });

            }


            const cleanName =
                name.trim();


            const cleanClass =
                className.trim();


            const allowedClasses = [

                "XII TKJ",
                "XII TO 1",
                "XII TO 2",
                "XII MPLB"

            ];


            if (
                !allowedClasses.includes(
                    cleanClass
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Kelas tidak valid."

                });

            }


            /* =========================
               ID SISWA
            ========================= */

            const lastStudent =
                db.prepare(`
                    SELECT id
                    FROM students
                    ORDER BY id DESC
                    LIMIT 1
                `).get();


            const nextId =
                lastStudent
                    ? Number(
                        lastStudent.id
                    ) + 1
                    : 1;


            const studentCode =
                "VTF" +
                String(
                    nextId
                ).padStart(
                    3,
                    "0"
                );


            /* =========================
               TOKEN
            ========================= */

            const students =
                db.prepare(`
                    SELECT token
                    FROM students
                `).all();


            let number =
                1;


            let token;


            do {

                token =
                    "SISWA" +
                    String(
                        number
                    ).padStart(
                        2,
                        "0"
                    );


                number++;

            } while (

                students.some(
                    student =>
                        student.token ===
                        token
                )

            );


            /* =========================
               NISN LAMA
               DIISI DENGAN ID SISWA
               AGAR DATABASE LAMA
               TETAP KOMPATIBEL
            ========================= */

            const result =
                db.prepare(`
                    INSERT INTO students
                    (
                        student_code,
                        name,
                        nisn,
                        class_name,
                        token
                    )
                    VALUES (?, ?, ?, ?, ?)
                `).run(

                    studentCode,
                    cleanName,
                    studentCode,
                    cleanClass,
                    token

                );


            const newStudent =
                db.prepare(`
                    SELECT
                        id,
                        student_code,
                        name,
                        class_name,
                        token,
                        has_voted
                    FROM students
                    WHERE id = ?
                `).get(
                    result.lastInsertRowid
                );


            res.status(201).json({

                success:
                    true,

                message:
                    "Siswa berhasil ditambahkan.",

                data:
                    newStudent

            });


        } catch (error) {

            console.error(
                "Add student error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal menambahkan siswa."

            });

        }

    }
);


/* =========================
   HAPUS SISWA
========================= */

app.delete(
    "/api/students/:id",
    (req, res) => {

        try {

            const studentId =
                Number(
                    req.params.id
                );


            if (!studentId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "ID siswa tidak valid."

                });

            }


            const student =
                db.prepare(`
                    SELECT *
                    FROM students
                    WHERE id = ?
                `).get(
                    studentId
                );


            if (!student) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Siswa tidak ditemukan."

                });

            }


            if (
                Number(
                    student.has_voted
                ) === 1
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Siswa yang sudah voting tidak dapat dihapus."

                });

            }


            db.prepare(`
                DELETE FROM students
                WHERE id = ?
            `).run(
                studentId
            );


            res.json({

                success:
                    true,

                message:
                    "Siswa berhasil dihapus."

            });


        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal menghapus siswa."

            });

        }

    }
);


/* =========================
   LOGIN SISWA
========================= */

app.post(
    "/api/login/student",
    (req, res) => {

        try {

            const {
                studentCode,
                token
            } = req.body;


            if (
                !studentCode ||
                !token
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "ID siswa dan token wajib diisi."

                });

            }


            const student =
                db.prepare(`
                    SELECT
                        id,
                        student_code,
                        name,
                        class_name,
                        token,
                        has_voted
                    FROM students
                    WHERE student_code = ?
                    AND token = ?
                `).get(

                    studentCode
                        .trim()
                        .toUpperCase(),

                    token
                        .trim()
                        .toUpperCase()

                );


            if (!student) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "ID siswa atau token tidak ditemukan."

                });

            }


            if (
                Number(
                    student.has_voted
                ) === 1
            ) {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "Akun ini sudah menggunakan hak suara."

                });

            }


            res.json({

                success:
                    true,

                message:
                    "Login berhasil.",

                student:
                    student

            });


        } catch (error) {

            console.error(
                "Student login error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Terjadi kesalahan pada server."

            });

        }

    }
);


/* =========================
   LOGIN ADMIN
========================= */

app.post(
    "/api/login/admin",
    (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Username dan password wajib diisi."

                });

            }


            const admin =
                db.prepare(`
                    SELECT
                        id,
                        username
                    FROM admins
                    WHERE username = ?
                    AND password = ?
                `).get(

                    username.trim(),
                    password.trim()

                );


            if (!admin) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Username atau password admin salah."

                });

            }


            res.json({

                success:
                    true,

                message:
                    "Login admin berhasil.",

                admin:
                    admin

            });


        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Terjadi kesalahan pada server."

            });

        }

    }
);


/* =========================
   GET PASLON
========================= */

app.get(
    "/api/candidates",
    (req, res) => {

        try {

            const candidates =
                db.prepare(`
                    SELECT
                        id,
                        number,
                        name,
                        vice_name,
                        image
                    FROM candidates
                    ORDER BY number ASC
                `).all();


            res.json({

                success:
                    true,

                data:
                    candidates

            });


        } catch (error) {

            console.error(
                "Candidates error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal mengambil data paslon."

            });

        }

    }
);


/* =========================
   TAMBAH PASLON
========================= */

app.post(
    "/api/candidates",
    upload.single("image"),
    (req, res) => {

        try {

            const {
                number,
                name,
                viceName
            } = req.body;


            if (
                !number ||
                !name ||
                !viceName
            ) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Nomor, nama ketua, dan nama wakil wajib diisi."

                });

            }


            const candidateNumber =
                Number(number);


            if (
                !Number.isInteger(
                    candidateNumber
                ) ||
                candidateNumber <= 0
            ) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Nomor Paslon tidak valid."

                });

            }


            const existing =
                db.prepare(`
                    SELECT id
                    FROM candidates
                    WHERE number = ?
                `).get(
                    candidateNumber
                );


            if (existing) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Nomor Paslon sudah digunakan."

                });

            }


            let image =
                null;


            if (req.file) {

                image =
                    "/uploads/candidates/" +
                    req.file.filename;

            }


            const result =
                db.prepare(`
                    INSERT INTO candidates
                    (
                        number,
                        name,
                        vice_name,
                        image
                    )
                    VALUES (?, ?, ?, ?)
                `).run(

                    candidateNumber,
                    name.trim(),
                    viceName.trim(),
                    image

                );


            const candidate =
                db.prepare(`
                    SELECT
                        id,
                        number,
                        name,
                        vice_name,
                        image
                    FROM candidates
                    WHERE id = ?
                `).get(
                    result.lastInsertRowid
                );


            res.status(201).json({

                success:
                    true,

                message:
                    "Paslon berhasil ditambahkan.",

                data:
                    candidate

            });


        } catch (error) {

            console.error(
                "Add candidate error:",
                error
            );


            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Gagal menambahkan paslon."

            });

        }

    }
);


/* =========================
   EDIT PASLON
========================= */

app.put(
    "/api/candidates/:id",
    upload.single("image"),
    (req, res) => {

        try {

            const candidateId =
                Number(
                    req.params.id
                );


            const {
                number,
                name,
                viceName
            } = req.body;


            const oldCandidate =
                db.prepare(`
                    SELECT *
                    FROM candidates
                    WHERE id = ?
                `).get(
                    candidateId
                );


            if (!oldCandidate) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Paslon tidak ditemukan."

                });

            }


            if (
                !number ||
                !name ||
                !viceName
            ) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Data Paslon belum lengkap."

                });

            }


            const candidateNumber =
                Number(number);


            if (
                !Number.isInteger(
                    candidateNumber
                ) ||
                candidateNumber <= 0
            ) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Nomor Paslon tidak valid."

                });

            }


            const duplicate =
                db.prepare(`
                    SELECT id
                    FROM candidates
                    WHERE number = ?
                    AND id != ?
                `).get(

                    candidateNumber,
                    candidateId

                );


            if (duplicate) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Nomor Paslon sudah digunakan."

                });

            }


            let image =
                oldCandidate.image;


            if (req.file) {

                image =
                    "/uploads/candidates/" +
                    req.file.filename;


                if (
                    oldCandidate.image
                ) {

                    const oldPath =
                        path.join(

                            __dirname,
                            "..",

                            oldCandidate.image
                                .replace(
                                    /^\//,
                                    ""
                                )

                        );


                    if (
                        fs.existsSync(
                            oldPath
                        )
                    ) {

                        fs.unlinkSync(
                            oldPath
                        );

                    }

                }

            }


            db.prepare(`
                UPDATE candidates
                SET
                    number = ?,
                    name = ?,
                    vice_name = ?,
                    image = ?
                WHERE id = ?
            `).run(

                candidateNumber,
                name.trim(),
                viceName.trim(),
                image,
                candidateId

            );


            const updated =
                db.prepare(`
                    SELECT
                        id,
                        number,
                        name,
                        vice_name,
                        image
                    FROM candidates
                    WHERE id = ?
                `).get(
                    candidateId
                );


            res.json({

                success:
                    true,

                message:
                    "Paslon berhasil diperbarui.",

                data:
                    updated

            });


        } catch (error) {

            console.error(
                "Edit candidate error:",
                error
            );


            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Gagal mengedit paslon."

            });

        }

    }
);


/* =========================
   HAPUS PASLON
========================= */

app.delete(
    "/api/candidates/:id",
    (req, res) => {

        try {

            const candidateId =
                Number(
                    req.params.id
                );


            const candidate =
                db.prepare(`
                    SELECT *
                    FROM candidates
                    WHERE id = ?
                `).get(
                    candidateId
                );


            if (!candidate) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Paslon tidak ditemukan."

                });

            }


            const votes =
                db.prepare(`
                    SELECT COUNT(*) AS count
                    FROM votes
                    WHERE candidate_id = ?
                `).get(
                    candidateId
                ).count;


            if (votes > 0) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Paslon yang sudah memiliki suara tidak dapat dihapus. Reset voting terlebih dahulu."

                });

            }


            db.prepare(`
                DELETE FROM candidates
                WHERE id = ?
            `).run(
                candidateId
            );


            if (
                candidate.image
            ) {

                const imagePath =
                    path.join(

                        __dirname,
                        "..",

                        candidate.image
                            .replace(
                                /^\//,
                                ""
                            )

                    );


                if (
                    fs.existsSync(
                        imagePath
                    )
                ) {

                    fs.unlinkSync(
                        imagePath
                    );

                }

            }


            res.json({

                success:
                    true,

                message:
                    "Paslon berhasil dihapus."

            });


        } catch (error) {

            console.error(
                "Delete candidate error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal menghapus paslon."

            });

        }

    }
);


/* =========================
   VOTE
========================= */

app.post(
    "/api/vote",
    (req, res) => {

        try {

            const {
                studentId,
                candidateId
            } = req.body;


            if (
                !studentId ||
                !candidateId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Data siswa dan paslon wajib diisi."

                });

            }


            const student =
                db.prepare(`
                    SELECT *
                    FROM students
                    WHERE id = ?
                `).get(
                    studentId
                );


            if (!student) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Siswa tidak ditemukan."

                });

            }


            if (
                student.has_voted === 1
            ) {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "Siswa ini sudah menggunakan hak suara."

                });

            }


            const candidate =
                db.prepare(`
                    SELECT *
                    FROM candidates
                    WHERE id = ?
                `).get(
                    candidateId
                );


            if (!candidate) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Paslon tidak ditemukan."

                });

            }


            const submitVote =
                db.transaction(
                    () => {

                        db.prepare(`
                            INSERT INTO votes
                            (
                                student_id,
                                candidate_id
                            )
                            VALUES (?, ?)
                        `).run(

                            studentId,
                            candidateId

                        );


                        db.prepare(`
                            UPDATE students
                            SET has_voted = 1
                            WHERE id = ?
                        `).run(
                            studentId
                        );

                    }
                );


            submitVote();


            res.json({

                success:
                    true,

                message:
                    "Suara berhasil disimpan.",

                candidate: {

                    id:
                        candidate.id,

                    number:
                        candidate.number,

                    name:
                        candidate.name,

                    vice_name:
                        candidate.vice_name,

                    image:
                        candidate.image

                }

            });


        } catch (error) {

            console.error(
                "Vote error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal menyimpan suara."

            });

        }

    }
);


/* =========================
   HASIL
========================= */

app.get(
    "/api/results",
    (req, res) => {

        try {

            const results =
                db.prepare(`
                    SELECT
                        c.id,
                        c.number,
                        c.name,
                        c.vice_name,
                        c.image,
                        COUNT(v.id)
                            AS vote_count
                    FROM candidates c
                    LEFT JOIN votes v
                        ON c.id = v.candidate_id
                    GROUP BY c.id
                    ORDER BY c.number ASC
                `).all();


            const total =
                db.prepare(`
                    SELECT
                        COUNT(*) AS total
                    FROM votes
                `).get().total;


            res.json({

                success:
                    true,

                total:
                    total,

                data:
                    results

            });


        } catch (error) {

            console.error(
                "Results error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal mengambil hasil voting."

            });

        }

    }
);


/* =========================
   RESET
========================= */

app.post(
    "/api/reset",
    (req, res) => {

        try {

            const resetVoting =
                db.transaction(
                    () => {

                        db.prepare(`
                            DELETE FROM votes
                        `).run();


                        db.prepare(`
                            UPDATE students
                            SET has_voted = 0
                        `).run();

                    }
                );


            resetVoting();


            res.json({

                success:
                    true,

                message:
                    "Data voting berhasil direset."

            });


        } catch (error) {

            console.error(
                "Reset error:",
                error
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Gagal mereset data voting."

            });

        }

    }
);


/* =========================
   ERROR UPLOAD
========================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Upload gambar gagal. Maksimal ukuran gambar 5 MB."

            });

        }


        if (error) {

            return res.status(400).json({

                success:
                    false,

                message:
                    error.message

            });

        }


        next();

    }
);


/* =========================
   START SERVER
========================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            " VOTIFY SERVER BERJALAN"
        );

        console.log(
            "================================"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log("");
       
    }
);
        console.log("");
  
;

module.exports = app;
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeMail, sendCancelationMail } = require("../emails/account");
const router = new express.Router();

//adding document to the users collections.
router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        await user.save();
        sendWelcomeMail(user.email, user.name);
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
    // User.save()
    //   .then(() => {
    //     res.status(201).send(user);
    //   })
    //   .catch((e) => {
    //     res.status(400).send(e); //by default status code is always 200. to customize it ,have to use status method.
    //   });
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});
//reading all document
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

// //reading document by id
// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

//updating user
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "age", "password", "email"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }
    try {
        updates.forEach((update) => (req.user[update] = req.body[update])); // we want to use user object dynamically.. that's why we use user[update], instead of user.update
        await req.user.save();
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //   new: true, //bool - true to return the modified document rather than the original. defaults to false
        //   runValidators: true, //if true, runs update validators on this command. Update validators validate the update operation against the model's schema
        // });

        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

//Delete User
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationMail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        //cb = callback
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("please upload an image"));
        }

        cb(undefined, true);
    },
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize(250, 250)
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;

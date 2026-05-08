// import jwt from "jsonwebtoken";

// const protect = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "Not authorized" });
//         }

//         const token = authHeader.split(" ")[1];

//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = decoded;

//         next();

//     } catch (error) {
//         return res.status(401).json({ message: "Token invalid or expired" });
//     }
// };

// export default protect;


import jwt from "jsonwebtoken";

const protect = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    // =========================
    // CHECK TOKEN
    // =========================
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // =========================
    // EXTRACT TOKEN
    // =========================
    const token =
      authHeader.split(" ")[1];

    // =========================
    // VERIFY TOKEN
    // =========================
    const decoded =
      jwt.verify(
        token,
        process.env.SECRET_KEY
      );

    // attach user
    req.user = decoded;

    next();

  } catch (error) {

    console.error(error);

    // =========================
    // TOKEN EXPIRED
    // =========================
    if (
      error.name ===
      "TokenExpiredError"
    ) {

      return res.status(401).json({
        success: false,
        message: "jwt expired",
      });
    }

    // =========================
    // INVALID TOKEN
    // =========================
    return res.status(401).json({
      success: false,
      message:
        "Token invalid or expired",
    });
  }
};

export default protect;
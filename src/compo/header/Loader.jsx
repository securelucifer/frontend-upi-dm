import { motion } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";

const Loader = ({ loading = true, message = ".....", size = 100, color = "#200d0d" }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.loaderContainer}
        >
            <div style={styles.loaderBox}>
                <ClipLoader color={color} loading={loading} size={size} />
                <p style={styles.text}>{message}</p>
                <div style={styles.dotsContainer}>
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        style={styles.dot}
                    />
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
                        style={styles.dot}
                    />
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                        style={styles.dot}
                    />
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                        style={styles.dot}
                    />
                    <motion.span
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                        style={styles.dot}
                    />
                </div>
            </div>
        </motion.div>
    );
};

const styles = {
    loaderContainer: {
        position: "fixed", // make it cover the screen
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)", // optional: slightly dark overlay; set to "transparent" if not needed
        backdropFilter: "blur(8px)", // soft blur for focus
        zIndex: 9999, // ensure it appears above other elements
    },
    loaderBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        borderRadius: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.05)", // optional subtle box background
    },
    text: {
        marginTop: "15px",
        fontSize: "18px",
        color: "white",
        fontWeight: "500",
    },
    dotsContainer: {
        display: "flex",
        marginTop: "10px",
    },
    dot: {
        width: "18px",
        height: "18px",
        backgroundColor: "#200d0d",
        borderRadius: "50%",
        margin: "0 4px",
    },
};

export default Loader;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useNavigationGuard = () => {
    const [isInternalNavigation, setIsInternalNavigation] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!isInternalNavigation) {
                event.preventDefault();
                event.returnValue = "Are you sure you want to leave? You may lose your data.";
            }
        };

        const handlePopState = (event) => {
            if (!isInternalNavigation) {
                const confirmLeave = window.confirm("Are you sure you want to leave? You may lose your data?");
                if (!confirmLeave) {
                    // Prevent navigation
                    window.history.pushState(null, "", window.location.href);
                }
            }
        };

        // Override browser history to trap back/forward navigation
        const overrideHistory = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        // Ensure back/forward buttons are intercepted
        overrideHistory();

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isInternalNavigation]);

    // Wrapped navigate function to prevent false alerts when navigating internally
    const safeNavigate = (url) => {
        setIsInternalNavigation(true);
        navigate(url);
        setTimeout(() => setIsInternalNavigation(false), 500); // Reset after a short delay
    };

    return safeNavigate;
};

export default useNavigationGuard;

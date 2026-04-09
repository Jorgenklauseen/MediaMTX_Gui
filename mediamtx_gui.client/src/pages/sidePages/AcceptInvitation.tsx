import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { acceptInvitation } from "../../api/invitationApi";

function AcceptInvitation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setErrorMessage("Invalid invitation link.");
            return;
        }

        acceptInvitation(token)
            .then(() => {
                setStatus("success");
                setTimeout(() => navigate("/projects"), 2000);
            })
            .catch(() => {
                setStatus("error");
                setErrorMessage("Could not accept invitation. The link may have expired.");
            });
    }, []);

    return (
        <div className="dashboard-page">
            {status === "loading" && <p>Accepting invitation...</p>}
            {status === "success" && (
                <div>
                    <h2>Invitation accepted!</h2>
                    <p>Redirecting to projects...</p>
                </div>
            )}
            {status === "error" && (
                <div>
                    <h2>Something went wrong</h2>
                    <p style={{ color: "red" }}>{errorMessage}</p>
                    <button onClick={() => navigate("/projects")}>Go to projects</button>
                </div>
            )}
        </div>
    );
}

export default AcceptInvitation;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
            <div className="text-center">
                <div style={{ fontSize: "5rem" }}>🔍</div>
                <h1 className="fw-bold display-4 mt-3 mb-2">404</h1>
                <h4 className="fw-semibold text-secondary mb-3">Page Not Found</h4>
                <p className="text-muted mb-4" style={{ maxWidth: 420, margin: "0 auto" }}>
                    The page you're looking for doesn't exist or may have been moved.
                    Please check the URL or return to the dashboard.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 fw-bold"
                        onClick={() => navigate("/home")}
                    >
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outline-secondary"
                        className="rounded-pill px-4"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </Container>
    );
}

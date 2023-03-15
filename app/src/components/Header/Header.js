import React from "react";
const Header = () => {
    return <header className="header">
        <div className="navbar-area">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-12">
                        <nav className="navbar navbar-expand-lg">
                            <a className="navbar-brand" href="index.html">
                                <img src="assets/images/logo/logo.svg" alt="Logo" />
                            </a>
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarSupportedContent"
                                aria-controls="navbarSupportedContent"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="toggler-icon" />
                                <span className="toggler-icon" />
                                <span className="toggler-icon" />
                            </button>
                            <div
                                className="collapse navbar-collapse sub-menu-bar"
                                id="navbarSupportedContent"
                            >
                                <div className="ms-auto">
                                    <ul id="nav" className="navbar-nav ms-auto">
                                        <li className="nav-item">
                                            <a className="page-scroll active" href="#home">
                                                Home
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="page-scroll" href="#features">
                                                Features
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="" href="#0">
                                                Pricing
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="" href="#0">
                                                Team
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="" href="#0">
                                                Testimonial
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="header-btn">
                                <a href="#0" className="main-btn btn-hover">
                                    Download
                                </a>
                            </div>
                            {/* navbar collapse */}
                        </nav>
                        {/* navbar */}
                    </div>
                </div>
                {/* row */}
            </div>
            {/* container */}
        </div>
        {/* navbar area */}
    </header>

}

export default Header;
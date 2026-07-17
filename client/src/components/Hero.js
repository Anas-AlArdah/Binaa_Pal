
import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";



function Hero({craft = []}) {
    const navigate = useNavigate();


    const handleCraftClick = (craftSlug) => {
        navigate(`/craftsman/${craftSlug}`);
    };




    return (

        <div className=" mt-md-5 "style={ {background: '#f4f7f9'}}>
            <div className="container-fluid hero position-relative overflow-hidden" style={{ height: "60vh" }}>

                {/* 🎥 الفيديو */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ objectFit: "cover", opacity: 0.6 }}
                >
                    <source src="/vedios/4973-181688494_tiny.mp4" type="video/mp4" />
                </video>

                <div className="position-relative z-1 h-100 d-flex flex-column justify-content-center align-items-center text-center text-white px-3">

                    <div className="hero-body">
                        <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" ,color: "#1A6B8A" }}>
                            ابحث عن أفضل الحرفيين في فلسطين
                        </h1>

                        <p className="fs-6 fs-md-5 text-muted mb-3">
                            آلاف الحرفيين المهرة في خدمتك — سريع، موثوق، وبأفضل الأسعار
                        </p>

                        <div className="mx-auto mb-4" style={{ width: "60px", height: "4px", background: "#F5A623" }}></div>

                        <div className="d-flex justify-content-center">
                            <SearchBox />
                        </div>
                    </div>



                </div>
            </div>




            <div className="d-flex justify-content-center flex-wrap gap-2">
                <h1 className="fw-bold mb-3" style={{ fontSize: "2.6rem", color: "#1A6B8A" }}>
                    المهن الشائعة
                </h1>
            </div>
            <div className=" justify-content-center   ">
                <div className="crafts-grid d-flex justify-content-center gap-2 ">
                    {craft.map((craft) => (
                        <div
                            className="cardBox
                             "
                            key={craft.id}
                            onClick={() => handleCraftClick(craft.slug)}                        >
                            <div className="card">
                                <div className="craft-preview">
                                    <div className="craft-icon">{craft.icon}</div>
                                    <div className="h4">{craft.name}</div>
                                </div>

                                <div className="content">
                                    <div className="h3">{craft.name}</div>
                                    <p>{craft.description}</p>
                                    <span className="workers-count">
                      متوفر {craft.workers} صنايعية
                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>



            </div>

        </div>

    );
}

export default Hero;

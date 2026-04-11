
import React from "react";
import Footer from "./Footer";
import Card from "./Card";



function Hero({craft = []}) {
    console.log(craft);

    const handleCraftClick = (craftName) => {
        console.log("الصنعة المختارة:", craftName);
    };

    return (

        <div className="container-fluid mt-md-5 "style={ {background: '#f4f7f9'}}>
            <div className="hero " style={{ position: "relative", overflow: "hidden",height: "60vh" }}>

                {/* الفيديو */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.5,
                        zIndex: 0,
                    }}
                >
                    <source src="/vedios/4973-181688494_tiny.mp4" type="video/mp4" />
                </video>

                {/* المحتوى فوق الفيديو */}
                <div  style={{ position: "relative", zIndex: 1 , top:"150px"}}>

                    <div className="hero-body ">
                        <div className="text-center mt-5 mb-4">
                            <h1 className="fw-bold mb-3" style={{ fontSize: "2.5rem", color: "#1A6B8A" }}>
                                ابحث عن أفضل الحرفيين في فلسطين
                            </h1>
                            <p className="text-muted fs-5">
                                آلاف الحرفيين المهرة في خدمتك — سريع، موثوق، وبأفضل الأسعار
                            </p>
                            <div style={{ width: "60px", height: "4px", background: "#F5A623", borderRadius: "2px", margin: "0 auto" }}></div>
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                           <Card/>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-3 pb-4">
                        {["سباكة", "كهرباء", "نجارة", "بلاط", "دهان"].map(tag => (
                            <span key={tag} className="badge rounded-pill bg-light  border px-3 py-2"
                                  style={{ cursor: "pointer", fontSize: "0.85rem" ,color: "black" }}>
                {tag}
              </span>
                        ))}
                    </div>

                </div>
            </div>


            <div className="text-center my-5">
                <div className="mt-5 mx-auto" style={{ maxWidth: "700px" }}>

                    {/* العنوان */}
                    <div className="mb-4">
            <span style={{
                background: "#1A6B8A",
                color: "white",
                padding: "6px 18px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "500"
            }}>
                ✨ مدعوم بالذكاء الاصطناعي
            </span>
                        <h2 className="fw-bold mt-3" style={{ color: "#1A6B8A", fontSize: "2rem" }}>
                            المساعد الذكي
                        </h2>
                        <p className="text-muted">اكتب ما تحتاجه وسيجد لك أفضل حرفي</p>
                    </div>

                    {/* صندوق المحادثة */}
                    <div style={{
                        background: "#f8f9fa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "16px",
                        padding: "20px",
                        minHeight: "200px",
                        marginBottom: "16px",
                        textAlign: "right"
                    }}>
                        {/* رسالة المساعد */}
                        <div className="d-flex align-items-start gap-2 mb-3">
                            <div style={{
                                background: "#1A6B8A",
                                color: "white",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                flexShrink: 0
                            }}>
                                🤖
                            </div>
                            <div style={{
                                background: "white",
                                border: "1px solid #e0e0e0",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                textAlign: "right",
                                fontSize: "0.95rem",
                                color: "#333"
                            }}>
                                مرحباً! أنا مساعدك الذكي. أخبرني ماذا تحتاج وسأجد لك أفضل الحرفيين 👷
                            </div>
                        </div>
                    </div>

                    {/* حقل الإدخال */}
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder=" ...مثال: أحتاج كهربائي لتركيب لمبات"
                            style={{
                                borderRadius: "12px",
                                border: "1px solid #1A6B8A",
                                padding: "12px 16px",
                                fontSize: "0.95rem",
                                boxShadow: "none"
                            }}
                        />
                        <button
                            className="btn"
                            style={{
                                background: 'linear-gradient(to right, #1A6B8A, #1A6B8A)',
                                color: "white",
                                borderRadius: "12px",
                                padding: "12px 20px",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                            }}
                        >
                            إرسال ➤
                        </button>
                    </div>

                </div>
            </div>

            <div className="d-flex justify-content-center flex-wrap gap-2">
                <h1 className="fw-bold mb-3" style={{ fontSize: "2.6rem", color: "#1A6B8A" }}>
                    المهن الشائعة
                </h1>
            </div>
            <div className="d-flex justify-content-center   ">
                <div className="crafts-grid d-flex justify-content-center gap-2 ">
                    {craft.map((craft) => (
                        <div
                            className="cardBox
                             "
                            key={craft.id}
                            onClick={() => console.log(craft.name)}
                        >
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
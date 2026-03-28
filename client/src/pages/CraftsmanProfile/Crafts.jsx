import React from "react";
import "./Crafts.css";
import {
  FaThLarge,
  FaPaintRoller,
  FaBolt,
  FaWrench,
  FaLayerGroup,
  FaHammer,
  FaWindowMaximize,
} from "react-icons/fa";
import { GiBrickWall } from "react-icons/gi";
import Header from "../../components/Header";
import Hero from "../../components/Hero";

export const crafts = [
  {
    id: 1,
    name: "التبليط",
    icon: <FaThLarge color="#3B82F6" />,
    description:
      "تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية",
    workers: 2,
  },
  {
    id: 2,
    name: "الدهان",
    icon: <FaPaintRoller color="#F97316" />,
    description: "دهان داخلي وخارجي وتشطيبات وديكورات",
    workers: 2,
  },
  {
    id: 3,
    name: "الكهرباء",
    icon: <FaBolt color="#EAB308" />,
    description: "تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية",
    workers: 2,
  },
  {
    id: 4,
    name: "السباكة",
    icon: <FaWrench color="#06B6D4" />,
    description: "تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية",
    workers: 2,
  },
  {
    id: 5,
    name: "الجبس والأسقف",
    icon: <FaLayerGroup color="#8B5CF6" />,
    description: "أسقف مستعارة، جبس بورد، وديكورات جبسية",
    workers: 2,
  },
  {
    id: 6,
    name: "النجارة",
    icon: <FaHammer color="#A16207" />,
    description: "أثاث مخصص، أبواب، مطابخ، وأعمال خشبية",
    workers: 1,
  },
  {
    id: 7,
    name: "الألمنيوم والحديد",
    icon: <FaWindowMaximize color="#64748B" />,
    description: "شبابيك، أبواب، درابزين، وأعمال معدنية",
    workers: 2,
  },
  {
    id: 8,
    name: "البناء والحجر",
    icon: <GiBrickWall color="#DC2626" />,
    description: "أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية",
    workers: 2,
  },
];


function Crafts() {
  const handleCraftClick = (craftName) => {
    console.log("الصنعة المختارة:", craftName);
  };

  return (
    <>
      <Header />


      <div className="crafts-page">
        <div className="crafts-container">
          <div className="crafts-header">
            <h1>جميع الصنعات</h1>
            <p>تصفح الصنايعية المهرة حسب نوع الصنعة</p>
          </div>

          <div className="crafts-grid">
            {crafts.map((craft) => (
              <div
                className="craft-card"
                key={craft.id}
                onClick={() => handleCraftClick(craft.name)}
              >
                <div className="craft-icon">{craft.icon}</div>
                <h3>{craft.name}</h3>
                <p>{craft.description}</p>
                <span>متوفر {craft.workers} صنايعية</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </>
  );
}

export default Crafts;


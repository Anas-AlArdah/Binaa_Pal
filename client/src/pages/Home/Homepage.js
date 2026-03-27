import Hero from "../../components/Hero";
import Header from "../../components/Header";
import {crafts} from "../CraftsmanProfile/Crafts"
import {useEffect, useState} from "react";
import Footer from "../../components/Footer";

function Homepage() {
    const [count,setCount] = useState(3);

    useEffect(()=>{
        if(count>5){
            setCount(5);
        }if(count<2){
            setCount(2);
        }
        const width = window.innerWidth;
        if(width <= 500){
            setCount(3);
        }
        if(width >= 500){
            setCount(4);
        }
    },[window.innerWidth]);




    return (
        <>
            <Header />
            <Hero craft={crafts.slice(0, count)} />
            <div className="d-flex justify-content-center gap-2 mt-3 mb-5 ">
                <button className="mt-3 btn btn-request-olive" onClick={()=>setCount(count+1)}>
                    عرض المزيد
                </button>
                <button className="mt-3  btn btn-request-olive" onClick={()=>setCount(count-1)}>
                    عرض
                    اقل
                </button>
            </div>
            <Footer />
        </>

    )
}
export default Homepage;
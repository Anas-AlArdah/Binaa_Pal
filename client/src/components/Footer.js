import React from 'react';
import { FaTwitter, FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';

function Footer() {
    return (
        <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '60px 0 20px', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', direction: 'rtl' }}>
                    
                    {/* الأعمدة */}
                    <div>
                        <h4 style={{ color: '#F59E0B', fontWeight: 900, marginBottom: '20px', fontSize: '18px' }}>المنصة</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>عن منصة بناء</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>كيف تعمل المنصة</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>تواصل معنا</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>الأسئلة الشائعة</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#F59E0B', fontWeight: 900, marginBottom: '20px', fontSize: '18px' }}>للعملاء</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>ابحث عن حرفي</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>كيف تطلب خدمة</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>تقييم الحرفيين</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#F59E0B', fontWeight: 900, marginBottom: '20px', fontSize: '18px' }}>للحرفيين</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>سجّل كحرفي</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>كيف تعرض خدماتك</a></li>
                            <li><a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>مميزات الانضمام</a></li>
                        </ul>
                    </div>

                    {/* السوشيال ميديا */}
                    <div>
                        <h4 style={{ color: '#F59E0B', fontWeight: 900, marginBottom: '20px', fontSize: '18px' }}>تابعنا</h4>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
                            <a href="#" style={{ color: '#fff', fontSize: '24px', transition: 'color 0.2s' }}><FaTwitter /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '24px', transition: 'color 0.2s' }}><FaInstagram /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '24px', transition: 'color 0.2s' }}><FaYoutube /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '24px', transition: 'color 0.2s' }}><FaFacebook /></a>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8', flexWrap: 'wrap' }}>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>تواصل معنا</a>
                            <span>|</span>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>سياسة الخصوصية</a>
                            <span>|</span>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>الشروط والأحكام</a>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    © {new Date().getFullYear()} بناء بال (Binaa Pal) - جميع الحقوق محفوظة
                </div>
            </div>
        </div>
    );
}

export default Footer;
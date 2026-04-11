import React from 'react';
import styled from 'styled-components';

const Input = () => {
    return (
        <StyledWrapper>
            <div className="container">
                <div className="search-container t">
                    <input className="input te" type="text" placeholder="ابحث عن حرفي أو خدمة.." />
                    <svg viewBox="0 0 24 24" className="search__icon">
                        <g>
                            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                        </g>
                    </svg>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    .container {
        position: relative;
        background: linear-gradient(135deg, rgba(165, 216, 125, 0.03) 0%, rgba(159, 244, 146, 0.02) 100%);
        border-radius: 1000px;
        padding: 10px;
        display: grid;
        place-content: center;
        z-index: 0;
        max-width: 300px;
        margin: 0 10px;
    }

    .search-container {
        position: relative;
        width: 100%;
        border-radius: 50px;
        background: #296d8a;
        padding: 5px;
        display: flex;
        align-items: center;
    }

    .search-container::before {
        content: "";
        width: 100%;
        height: 100%;
        border-radius: inherit;
        position: absolute;
        top: -1px;
        left: -1px;
        background: #296d8a;
        z-index: -1;
    }

    .search-container::after {
        content: "";
        width: 100%;
        height: 100%;
        border-radius: inherit;
        position: absolute;
        bottom: -1px;
        right: -1px;

        background: linear-gradient(135deg, #296d8a 0%, #ffffff 100%)
        z-index: -2;
    }

    .input {
        padding: 10px;
        width: 100%;
        background: #296d8a;
        border: none;
        color: #ffffff; /* ليكون واضح */
        font-size: 16px;
        border-radius: 50px;
        font-family: 'Tajawal', sans-serif;
        direction: rtl;
        position: relative; /* مهم */
        z-index: 1; /* مهم */
    }

    .input::placeholder {
        color: white;
    }

    .input:focus {
        outline: none;
        background: linear-gradient(135deg, rgba(221, 229, 204, 0.24) 0%, rgba(197, 206, 175, 0.24) 100%);
    }

    .search__icon {
        width: 50px;
        aspect-ratio: 1;
        border-left: 2px solid #e8eddc;
        border-top: 3px solid transparent;
        border-bottom: 3px solid transparent;
        border-radius: 50%;
        padding-left: 12px;
        margin-right: 10px;
        cursor: pointer;
    }

    .search__icon:hover {
        border-left: 3px solid #fff;
    }

    .search__icon path {
        fill: #e8eddc;
    }
`;

export default Input;
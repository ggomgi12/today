# Project Blueprint

## Overview

A personal dashboard application that provides users with quick access to daily information, frequently used links, and useful tools. This is a single-page application built with HTML, CSS, and JavaScript.

## Implemented Features

### V1

*   **Greeting and Live Clock:** The dashboard greets the user and displays a live updating clock and date.
*   **Language Toggle:** Users can switch the language of the dashboard between Korean and English.
*   **Tabbed Interface:** The main content is organized into three tabs: "오늘의 즐거움" (Daily Fun), "사진 변환" (Image Converter), and "글자수/맞춤법" (Text Tools).
*   **"오늘의 즐거움" (Daily Fun) Tab:**
    *   **Quick Links:** A list of links to frequently visited websites like YouTube, Netflix, and Naver News.
    *   **Quick Note:** A widget for taking quick notes with persistence using `localStorage`.
*   **"사진 변환" (Image Converter) Tab:**
    *   **Drag & Drop Interface:** Easy file selection with drag-and-drop or file browser.
    *   **Format Conversion:** Convert images to JPEG, PNG, WEBP, BMP.
    *   **Image to PDF:** Combine multiple images into a single PDF document using `jsPDF`.
    *   **Batch Actions:** Clear all files at once.
*   **"글자수/맞춤법" (Text Tools) Tab:**
    *   **Character Counter:** Real-time counting of characters including and excluding spaces.
    *   **Spell Checker Integration:** Button to open an external professional Korean spell checker (Saramin) with the current text.

### V2 (Update)

*   **Fortune & Saju (개편):** "오늘의 즐거움" 탭이 전문적인 사주 및 운세 서비스로 개편되었습니다.
    *   **Saju Analysis:** 사용자의 생년월일시(양력/음력/윤달)를 입력받아 만세력을 계산하고 사주 8자(간지)를 추출합니다.
    *   **Gemini AI Fortune:** 추출된 사주 데이터를 구글 제미나이(Gemini) API로 전송하여 맞춤형 오늘의 운세를 생성합니다.
    *   **Daily Recommendations:** 운세를 기반으로 한 행운의 코디(옷차림)와 오늘의 점심 메뉴 추천 기능을 제공합니다.
    *   **Backend Integration:** Firebase Functions와 `lunar-javascript` 라이브러리를 사용하여 서버사이드에서 정밀한 만세력 계산 및 AI 연동을 처리합니다.
    *   **Bug Fix:** Resolved issues where the fortune-telling feature failed due to undefined variables and incorrect object access. Added robust error handling and mock data fallbacks.
    *   **UI Improvement:** Adjusted the height of the character count text area and optimized the width of date/time input fields for better visual balance.

## History of Changes

*   **Replaced "Daily Fun" with Fortune Service:** The previous quick links and notes were replaced with a more personalized Saju and Fortune analysis tool powered by AI.
*   **Gemini API Integration:** Connected the application to Gemini 1.5 Flash for dynamic content generation.
*   **Firebase Functions Setup:** Initialized a backend environment to handle complex calculations and secure API calls.
*   **Fix Fortune Logic & Adjust UI Components:** Fixed a critical bug in `main.js` related to mock data access and refined input field styles in `style.css`.

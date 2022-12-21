export const btnLogin = document.querySelector('#btnLogin');
export const btnLogout = document.querySelector('#btnLogout');
export let etEmail = document.querySelector('#etEmail');
export let etPassword = document.querySelector('#etPassword');
export const errLogin = document.querySelector('#errLogin');
export const tbodyRequests = document.querySelector('#tbodyRequests');
export const tbodyNews = document.querySelector('#tbodyNews');
// news modal
export const modalNews = document.querySelector('#modalNews');
export const tvAddNews = document.querySelector('#tvAddNews');
export const etTitle = document.querySelector('#etTitle');
export const etContent = document.querySelector('#etContent');
export const btnSaveNews = document.querySelector('#btnSaveNews');
// request navlinks
export const navClearance = document.querySelector('#navClearance');
export const navId = document.querySelector('#navId');
export const navResidency = document.querySelector('#navResidency');
export const navIndigency = document.querySelector('#navIndigency');
export const navBusinessPermit = document.querySelector('#navBusinessPermit');
export const tabTitle = document.querySelector('#tabTitle');

export function generateAvatar() {
    const imgAvatar = document.querySelector('#imgAvatar');
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const foregroundColor = "white";
    const backgroundColor = '#028cf0';

    canvas.width = 50;
    canvas.height = 50;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "400 1.3rem Poppins";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("A", canvas.width / 2, canvas.height / 2);

    imgAvatar.src = canvas.toDataURL("image/png");
    imgAvatar.style.borderRadius = "50%";
}
export function parseDate(millis) {
    const date = new Date(millis);
    const formattedDate = date.toLocaleString('en-US',
        {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
            // weekday:"long",
            // hour: '2-digit',
            // hour12: true,
            // minute:'2-digit',
            //second:'2-digit'
        });
    return formattedDate;
}

export function parseTime(millis) {
    const date = new Date(millis);
    const formattedDate = date.toLocaleString('en-US',
        {
            // year: '2-digit',
            // month: '2-digit',
            // day: '2-digit'
            // weekday:"long",
            hour: '2-digit',
            hour12: true,
            minute:'2-digit',
            // second:'2-digit'
        });
    return formattedDate;
}

export function parseDateTime(millis) {
    const date = new Date(millis);
    const formattedDate = date.toLocaleString('en-US',
        {
             year: '2-digit',
             month: '2-digit',
             day: '2-digit',
            // weekday:"long",
            hour: '2-digit',
            hour12: true,
            minute:'2-digit'
            // second:'2-digit'
        });
    return formattedDate;
}

export function parseFullName(firstName, middleName, lastName) {
    return firstName + " " + middleName.substring(0, 1).toUpperCase() + ". " + lastName;
}

export function parseStatus(status) {
    if (status == 0) {
        return "Pending";
    }
    else if (status == 1) {
        return "Processing";
    }
    else if (status == 2) {
        return "Completed";
    }
    else if (status == 3) {
        return "Declined"; 
    }
    else {
        return "Unknown"; 
    }
}

export function parseAction(status) {
    if (status == 0) {
        return "Accept";
    }
    else if (status == 1) {
        return "Complete";
    }
    else if (status == 2) {
        return "Delete";
    }
    else if (status == 3) {
        return "Delete";
    }
    else {
        return "Unknown";
    }
}
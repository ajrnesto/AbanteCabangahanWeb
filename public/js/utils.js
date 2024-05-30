/* authentication */
export function authenticate(user) {
	if (!user) {
		window.location = "../login.html";
		return;
	}

	if (!user.email.includes("admin")) {
		window.location = "../login.html";
		return;
	}

	window.location = "../services.html";
}

export function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
			// You do not need to check if i is larger than splitStr length, as your for does that for you
			// Assign it back to the array
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	}
	// Directly return the joined string
	return splitStr.join(' '); 
}

export function showModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.show();
}

export function hideModal(modalId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.querySelector(modalId)); 
    modal.hide();
}

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

export function getNthDayOfMonth(millis) {
	const date = new Date(Number(millis));

	const day = String(date.getDate());
	const lastDigit = day.substring(day.length-1, day.length);

	if (day >= 11 && day <= 13) {
		return day + "th";
	}

	if (lastDigit == 1) {
		return day + "st";
	}
	else if (lastDigit == 2) {
		return day + "nd";
	}
	else if (lastDigit == 3) {
		return day + "rd";
	}
	else {
		return day + "th";
	}
}

export function getMonth(millis) {
	const date = new Date(Number(millis));

	const month = String(date.getMonth());

	if (month == 0) {
		return "January";
	}
	else if (month == 1) {
		return "February";
	}
	else if (month == 2) {
		return "March";
	}
	else if (month == 3) {
		return "April";
	}
	else if (month == 4) {
		return "May";
	}
	else if (month == 5) {
		return "June";
	}
	else if (month == 6) {
		return "July";
	}
	else if (month == 7) {
		return "August";
	}
	else if (month == 8) {
		return "September";
	}
	else if (month == 9) {
		return "October";
	}
	else if (month == 10) {
		return "November";
	}
	else if (month == 11) {
		return "December";
	}
}

export function parseFullName(firstName, middleName, lastName) {
	if (middleName) {
		console.log(middleName)
    return firstName + " " + middleName.substring(0, 1).toUpperCase() + ". " + lastName;
	}
	else {
    return firstName + " " + lastName;
	}
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

export function parseActionText(status) {
    if (status == "PENDING") {
        return "Mark as Completed";
    }
    else if (status == "COMPLETED") {
        return "Print Document";
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

export function parseCrimeActionText(status) {
    if (status == "PENDING") {
        return "Mark as Under Investigation";
    }
    else if (status == "UNDER INVESTIGATION") {
        return "Mark as Resolved";
    }
    else {
        return "Unknown Status";
    }
}

export function parseIncidentActionText(status) {
    if (status == "PENDING") {
        return "Set Hearing Schedule";
    }
    else if (status == "HEARING SCHEDULED") {
        return "Mark as Under Investigation";
    }
    else if (status == "UNDER INVESTIGATION") {
        return "Mark as Resolved";
    }
    else {
        return "Unknown Status";
    }
}

export function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-invalid', false);
		element.classList.toggle('is-valid', true);
	});
}

export function invalidate(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', true);
	});
}

export function resetValidation(elements) {
	elements.forEach((element) => {
		element.classList.toggle('is-valid', false);
		element.classList.toggle('is-invalid', false);
	});
}
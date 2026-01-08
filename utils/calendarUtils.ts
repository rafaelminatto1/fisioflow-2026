interface CalendarEventParams {
  title: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  description?: string;
  location?: string;
}

const formatDateForGoogle = (isoDate: string): string => {
  return isoDate.replace(/-|:|\.\d+/g, '');
};

export const getGoogleCalendarLink = ({ title, startTime, endTime, description, location }: CalendarEventParams): string => {
  const start = formatDateForGoogle(startTime);
  const end = formatDateForGoogle(endTime);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description || '',
    location: location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const getOutlookCalendarLink = ({ title, startTime, endTime, description, location }: CalendarEventParams): string => {
  const params = new URLSearchParams({
    subject: title,
    startdt: startTime,
    enddt: endTime,
    body: description || '',
    location: location || ''
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};

import { api, LightningElement, track } from 'lwc';
// Apex Controller methods
import getSpeakers from '@salesforce/apex/EventDetailsController.getSpeakers';
import getLocationDetails from '@salesforce/apex/EventDetailsController.getLocationDetails';
import getAttendees from '@salesforce/apex/EventDetailsController.getAttendees';

// Prepare columns to display for Speaker tab
const speakerColumns = [
    { label: 'Speaker Name', fieldName: 'Name' },
    { label: 'Speaker Email', fieldName: 'Email', type: 'email' },
    { label: 'Speaker Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Speaker Company', fieldName: 'Company'}
];

// Prepare columns to display for Attendees tab
const attendeeColumns = [
    { label: 'Attendee Name', fieldName: 'Name' },
    { label: 'Attendee Email', fieldName: 'Email', type: 'email' },
    { label: 'Attendee Company', fieldName: 'Company'},
    { label: 'Attendee Location', fieldName: 'Location'}
];

export default class MfEventDetails extends LightningElement {
    @api recordId;
    @track speakerList;
    @track eventRecord;
    @track attendeeList;
    errorMessage;
    speakerColumnList = speakerColumns; // Assign the above speakerColumns to speakerColumnList to display in UI
    attendeeColumnList = attendeeColumns; // Assign the above attendeeColumns to attendeeColumnList to display in UI
    

    async handleSpeakerActive() {
        try {
            // Call Apex method then save to result variable
            let result =  await getSpeakers({eventId: this.recordId});
            // Loop through the result variable to get evety single record
            result.forEach(speaker => {
                speaker.Name = speaker.Speaker__r.Name;
                speaker.Email = speaker.Speaker__r.Email__c;
                speaker.Phone = speaker.Speaker__r.Phone__c;
                speaker.Company = speaker.Speaker__r.Company__c;
            });
            this.speakerList = result;
            this.errorMessage = undefined;
        } catch (error) {
            this.errorMessage = error;
            this.speakerList = undefined;
        }
    }

    async handleLocationActive() {
        try {
            // Call Apex method then save to result variable
            let result =  await getLocationDetails({eventId: this.recordId});
            if (result.Location__c != null) {
                this.eventRecord = result;
            } else {
                this.eventRecord = undefined
            }
            this.errorMessage = undefined;
        } catch (error) {
            this.errorMessage = error;
        }
    }

    async handleAttendeesActive() {
        try {
            // Call Apex method then save to result variable
            let result =  await getAttendees({eventId: this.recordId});
            // Loop through the result variable to get evety single record
            result.forEach(attendee => {
                attendee.Name = attendee.Attendee__r.Name;
                attendee.Email = attendee.Attendee__r.Email__c;
                attendee.Company = attendee.Attendee__r.Company_Name__c;
                if (attendee.Attendee__r.Location__c) {
                    attendee.Location = attendee.Attendee__r.Location__r.Name;
                } else {
                    attendee.Location = "Not yet";
                }
            });
            this.attendeeList = result;
            this.errorMessage = undefined;
        } catch (error) {
            this.attendeeList = undefined;
            this.errorMessage = error;
        }
    }
}
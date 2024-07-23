import { api, LightningElement, track } from 'lwc';
import getFutureEventsOfAttendee from '@salesforce/apex/EventDetailsController.getFutureEventsOfAttendee';
import getPastEventsOfAttendee from '@salesforce/apex/EventDetailsController.getPastEventsOfAttendee';

const columns = [
    {
        label: 'Event Name', 
        fieldName: 'URL', 
        type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'Name'
            }
        }
    },
    { label: 'Event Name', fieldName: 'Name' },
    { label: 'Event Organizer', fieldName: 'EVT_ORG'},
    { label: 'Event Date', fieldName: 'StartDateTime', type: 'datetime'},
    { label: 'Location', fieldName: 'Location', type: 'text'}
];

export default class MfEventsOfAttendee extends LightningElement {
    @api recordId;
    @track futureEventList;
    @track pastEventList;
    errorMessage;
    columnsList = columns;

    connectedCallback() {
        this.attendeeFutureEvents();
        this.attendeePastEvents();
    }

    async attendeeFutureEvents() {
        try {
            let result = await getFutureEventsOfAttendee({attendeeId: this.recordId});
            result.forEach((event) => {
                event.Name = event.Event__r.Name__c;
                event.URL = 'https://' + window.location.host + '/' + event.Event__c;
                event.EVT_ORG = event.Event__r.Event_Organizer__r.Name;
                event.StartDateTime = event.Event__r.Start_DateTime__c;
                if (event.Event__r.Location__r) {
                    event.Location = event.Event__r.Location__r.Name;
                } else {
                    event.Location = 'This Event is Virtual';
                }
            });
            this.futureEventList = result;
            this.errorMessage = undefined;
        } catch (error) {
            this.futureEventList = undefined;
            this.errorMessage = JSON.stringify(error);
        }
    }

    async attendeePastEvents() {
        try {
            let result = await getPastEventsOfAttendee({attendeeId: this.recordId});
            result.forEach((event) => {
                event.Name = event.Event__r.Name__c;
                event.URL = 'https://' + window.location.host + '/' + event.Event__c;
                event.EVT_ORG = event.Event__r.Event_Organizer__r.Name;
                event.StartDateTime = event.Event__r.Start_DateTime__c;
                if (event.Event__r.Location__r) {
                    event.Location = event.Event__r.Location__r.Name;
                } else {
                    event.Location = 'This Event is Virtual';
                }
            });
            this.pastEventList = result;
            console.error("PAST EVENT: " + result);
            this.errorMessage = undefined;
        } catch (error) {
            console.error(JSON.stringify(error))
            this.pastEventList = undefined;
            this.errorMessage = JSON.stringify(error);
        }
    }
}
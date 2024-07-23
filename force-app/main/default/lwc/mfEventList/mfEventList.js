import { LightningElement, track, wire } from 'lwc';
import getUpcomingEvents from '@salesforce/apex/EventDetailsController.getUpcomingEvents';

const columns = [
    {
        label: 'View', 
        fieldName: 'URL', 
        type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'Name__c'
            }
        }
    },
    { label: 'Event Name', fieldName: 'Name__c' },
    { label: 'Event Organizer', fieldName: 'EVT_ORG'},
    { label: 'Location', fieldName: 'Location__c', type: 'text'},
    { label: 'Details', fieldName: 'Event_Detail__c', type: 'text', wrapText:true}
];

export default class MfEventList extends LightningElement {
    columnList = columns;
    @track eventList;
    error;

    connectedCallback() {
        this.getAllUpcomingEvents(); // call getAllUpcomingEvents method whenever the component loaded
    }

    async getAllUpcomingEvents() {
        try {
            let data = await getUpcomingEvents();
            data.forEach((event) => {
                event.URL = 'https://' + window.location.host + '/' + event.Id;
                event.EVT_ORG = event.Event_Organizer__r.Name;
                if (event.Location__c) {
                    event.Location__c = event.Location__r.Name;
                } else {
                    event.Location__c = 'This Event is Virtual';
                }
            });
            this.eventList = data;
            this.error = undefined;
        } catch (error) {
            console.log('error: ' + JSON.stringify(err));
            this.error = JSON.stringify(err);
            this.eventList = undefined;
        }
    }
}
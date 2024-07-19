import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
// Event__c object
import EVT_OBJECT from '@salesforce/schema/Event__c';
import EVT_NAME from '@salesforce/schema/Event__c.Name__c';
import EVT_ORG from '@salesforce/schema/Event__c.Event_Organizer__c';
import EVT_STARTDATE from '@salesforce/schema/Event__c.Start_DateTime__c';
import EVT_ENDDATE from '@salesforce/schema/Event__c.End_Date_Time__c';
import EVT_MAXSEAT from '@salesforce/schema/Event__c.Max_Seats__c';
import EVT_LOCATION from '@salesforce/schema/Event__c.Location__c';
import EVT_DETAIL from '@salesforce/schema/Event__c.Event_Detail__c';
// Navigation Service
import { NavigationMixin } from 'lightning/navigation';
// Show Toast Event 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MfAddEvent extends NavigationMixin(LightningElement) {
    @track eventRecord = {
        Name: '',
        Event_Organizer__c: '',
        Start_DateTime__c: null,
        End_Date_Time__c: null,
        Max_Seats__c: null,
        Location__c: '',
        Event_Detail__c: ''
    }

    @track errors;

    // When user change the input value
    handleChange(event) {
        let value = event.target.value;
        let name = event.target.name;
        this.eventRecord[name] = value;
    }

    // When user select Event_Organizer__c and Location__c
    handleLookup(event) {
        let selectedRecId = event.detail.selectedRecordId;
        let parentField = event.detail.parentfield;
        this.eventRecord[parentField] = selectedRecId;
    }

    // When user click on Save button => save Event
    async handleClick() {
        // Prepare the Event record to be saved
        const fields = {};
        fields[EVT_NAME.fieldApiName] = this.eventRecord.Name;
        fields[EVT_ORG.fieldApiName] = this.eventRecord.Event_Organizer__c;
        fields[EVT_STARTDATE.fieldApiName] = this.eventRecord.Start_DateTime__c;
        fields[EVT_ENDDATE.fieldApiName] = this.eventRecord.End_Date_Time__c;
        fields[EVT_MAXSEAT.fieldApiName] = this.eventRecord.Max_Seats__c;
        fields[EVT_LOCATION.fieldApiName] = this.eventRecord.Location__c;
        fields[EVT_DETAIL.fieldApiName] = this.eventRecord.Event_Detail__c;

        const eventRecord = { apiName: EVT_OBJECT.objectApiName, fields };

        try {
            // Call the built-in createRecord method
            const eventRec = await createRecord(eventRecord);
            // If save Event success => ShowToastEvent for success message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Event Created',
                message: 'Event Draft is Ready',
                variant: 'success'
            }));
            
            // Nagivate to detail page of new Event
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    actionName: "view",
                    recordId: eventRec.id
                }
            });
        } catch (err) {
            this.errors = JSON.stringify(err);
            // If error => ShowToastEvent for error message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error Occurred',
                message: this.errors,
                variant: 'error'
            }));
            console.log(JSON.stringify(err));
        }
    }

    // Click Cancel button => navigate to Event homepage
    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                actionName: "home",
                objectApiName: "Event__c"
            }
        });
    }
}
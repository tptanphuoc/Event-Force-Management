// The trigger to send an email whenever an Attendee registered an Event successfully
public with sharing class EventAttendeeTriggerHandler {
    public static void sendConfirmationEmail(List<Event_Attendee__c> newRecordList) {
        // Create two Set to store AttendeeIds and EventIds
        Set<Id> attendeesIdsSet = new Set<Id>();
        Set<Id> eventIdsSet = new Set<Id>();

        // Take data from Trigger and add to both Set
        for (Event_Attendee__c ea : newRecordList) {
            attendeesIdsSet.add(ea.Attendee__c);
            eventIdsSet.add(ea.Event__c);
        }

        // Select Attendee from the above attendeesIdsSet
        Map<Id, Attendee__c> attendeeMap = new Map<Id, Attendee__c>(
            [SELECT Id, Name, Email__c FROM Attendee__c
             WHERE Id IN : attendeesIdsSet]);

        // Select Event from the above eventIdsSet
        Map<Id, Event__c> eventMap = new Map<Id, Event__c>(
            [SELECT Id, Name__c, Start_DateTime__c, Event_Organizer__c, 
                    Event_Organizer__r.Name, Location__c, Location__r.Name,
                    Location__r.City__c, Location__r.State__c, 
                    Location__r.Country__c, Location__r.Postal_Code__c, Location__r.Street__c
            FROM Event__c
            WHERE Id IN : eventIdsSet]);

        // Prepare for send email
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            // Loop over the list of Trigger.New
            for (Event_Attendee__c ea : newRecordList) {
                // Get the Attendee by current Attendee object in Trigger.New
                Attendee__c att = attendeeMap.get(ea.Attendee__c);
                // Get the Event by current Event object in Trigger.New
                Event__c evt = eventMap.get(ea.Event__c);
                List<String> toEmailList = new List<String>();
                // Add email of current Attendee to the List
                toEmailList.add(att.Email__c);
                // Prepare email template to send
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                mail.setSubject('Pass for the ' + evt.Name__c); // Set the subject of the email
                mail.setToAddresses(toEmailList);
                mail.setSenderDisplayName(evt.Event_Organizer__r.Name);
                String emailBody = 'Dear ' + att.Name + '<br/><br/>' +
                                    'Thank you for registering for ' + evt.Name__c + ' which will be held on ' +
                                    evt.Start_DateTime__c + ' & will be held in ' + evt.Location__r.Name +
                                    '. We are excited to have you here. <br/><br/>' + evt.Event_Organizer__r.Name;
                mail.setHtmlBody(emailBody);
                emailList.add(mail);
            }
        try {
            List<Messaging.SendEmailResult> results = Messaging.sendEmail(emailList, false);
            for (Messaging.SendEmailResult rs : results) {
                if (!rs.isSuccess()) {
                    List<Messaging.SendEmailError> errors = rs.getErrors();
                    TransactionLogHandler.doHandleExceptionWithError(JSON.serialize(errors), 'EventAttendeeTriggerHandler');
                }
            }
        } catch (System.Exception ex) {
            TransactionLogHandler.doHandleException(ex, 'EventAttendeeTriggerHandler');
        }
    }
}
    import { LightningElement, track, api ,wire} from 'lwc';  
    import getOppList from '@salesforce/apex/OppList.getOppList';
    import { updateRecord } from 'lightning/uiRecordApi';
    import { refreshApex } from '@salesforce/apex';
    import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ACCOUNT_FIELD from '@salesforce/schema/Opportunity.AccountId';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import CLOSEDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
    const COLS = [
        { label: 'Opportunity', fieldName: 'Name',editable: true,sortable: true},
        { label: 'Account', fieldName: 'AccountName', type:'text',sortable: true,editable: true},
        { label: 'Stage', fieldName: 'StageName',editable: true, sortable: true },
        { label: 'Close Date', fieldName: 'CloseDate',type: 'date',editable: true,sortable: true },
        { label: 'Amount', fieldName: 'Amount',type: 'currency',editable: true,sortable: true },
    
    ];
    let i=0;
    export default class OpportunityList extends LightningElement {
        @api name;
        @track error;
        @track draftValues = [];
        @track columns = COLS;
        @track strSearchName = '';
        @track page = 1; 
    @track items = []; 
    @track finaldata = []; 
    @track startingRecord = 1; 
    @track endingRecord = 0; 
    @track pageSize = 10; 
    @track totalRecountCount = 0; 
    @track totalPage = 0; 
    @track sortBy='Name';
  @track sortDirection='asc';
  fields = [NAME_FIELD,ACCOUNT_FIELD,STAGE_FIELD,CLOSEDATE_FIELD,AMOUNT_FIELD];

    @track openmodel = false;
    wiredsObjectData;

    @wire(getOppList, { strName: '$strSearchName',field : '$sortBy',sortOrder : '$sortDirection'})
    wiredOpps(result) {
        this.wiredsObjectData = result;
        if (result.data) {
            let currentData = [];
            result.data.forEach((row) => {
                let rowData = {};
                rowData.Id=row.Id;
                rowData.Name = row.Name;
                rowData.StageName = row.StageName;
                rowData.CloseDate = row.CloseDate;
                rowData.Amount = row.Amount;
                if (row.Account) {
                    rowData.AccountName = row.Account.Name;
                }
                currentData.push(rowData);
            });
            this.finaldata = currentData;

            this.items = currentData;
            this.totalRecountCount = currentData.length;
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            this.finaldata = this.items.slice(0,this.pageSize); 
            if(this.totalRecountCount < this.pageSize)
                this.endingRecord= this.totalRecountCount;
            else
                this.endingRecord = this.pageSize;
            
            this.columns = columns;
            console.log('----no error--');
            this.error = undefined;
        } else if (result.error) {
            console.log('----error--');
            this.error = result.error;
            this.finaldata = undefined;

        }
    }
    
    openmodal() {
        this.openmodel = true;
    }
    handleCancel() {
        this.openmodel = false;
    } 
    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Opportunity created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.openmodel = false;
        return refreshApex(this.wiredsObjectData);

    }
  
    handleSave(event) {
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
   
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
       
        Promise.all(promises).then(contacts => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Opportunity updated',
                    variant: 'success'
                })
            );
             this.draftValues = [];
   
             return refreshApex(this.wiredsObjectData);
            }).catch(error => {
                console.log('---error---'+error.body.message);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record:',
                    message: 'Account is a lookup field',
                    variant: 'error'
                })
            
            );
        });
    }
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; 
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; 
            this.displayRecordPerPage(this.page);            
        }             
    }

    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.finaldata = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    } 
    updateColumnSorting(event){
        let fieldName = event.detail.fieldName;
        console.log('---fieldName---'+fieldName);
    let sortDirection = event.detail.sortDirection;
    this.sortBy = fieldName;
    this.sortDirection = sortDirection;
      }

        handleName(event) {
            this.strSearchName = event.detail.value;
        }   
    }

    /*  handleSave(event) {
        console.log('-----in save---'+event.detail.draftValues);
        const fields = {};
      //  fields[OPPID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[ACCID_FIELD.fieldApiName] = event.detail.draftValues[0].AccountId;
        console.log('----record value----'+event.detail.draftValues[0].AccountId);

        fields[ACCOUNTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].AccountName;
        console.log('----record value----'+event.detail.draftValues[0].AccountName);
      //  fields[STAGE_FIELD.fieldApiName] = event.detail.draftValues[0].StageName;
     //   fields[CLOSEDATE_FIELD.fieldApiName] = event.detail.draftValues[0].CloseDate;
     //   fields[AMOUNT_FIELD.fieldApiName] = event.detail.draftValues[0].Amount;
     //   fields[NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;


        const recordInput = {fields};
        console.log('-----recordInput---'+recordInput);

        for(var i in fields){
            console.log('-----i---'+i);
            console.log(fields[i]);
        }
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
            this.draftValues = [];
            console.log('----draftValues--');
            return refreshApex(this.wiredsObjectData);
        }).catch(error => {
            console.log('----error catch--'+error.body);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }*/
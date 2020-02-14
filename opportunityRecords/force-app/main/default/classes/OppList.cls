

public with sharing class OppList {
   @AuraEnabled(cacheable = true)  
   public static List<Opportunity> getOppList(String strName,String field, String sortOrder) {
       String query='select id, Name,AccountId,Account.Name, StageName,CloseDate,Amount from Opportunity';
       if(field!='AccountName') {
       if(strName!=null && strName!=''){
           strName = '%' + strName + '%';
          
            return Database.query(query+' WHERE Name LIKE :strName OR Account.Name LIKE :strName ORDER BY '+field+' '+sortOrder);
          } else{
        return Database.query(query+' ORDER BY '+field+' '+sortOrder);
       }
       }else{
           if(strName!=null && strName!=''){
           strName = '%' + strName + '%';
          
            return Database.query(query+' WHERE Name LIKE :strName OR Account.Name LIKE :strName ORDER BY Account.Name '+sortOrder);
   
       } else{
        return Database.query(query+' ORDER BY Account.Name '+sortOrder);

       }
       }
      
    }
}
     
 
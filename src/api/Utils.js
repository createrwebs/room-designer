

export const getUserName = (participant, withOrg = true) => {
    if (!participant) return "";
    let fname, lname, orgName
    if (participant.getProperty) {
        lname = participant.getProperty('LNAME');
        if (!lname) return "";
        fname = participant.getProperty('FNAME');
        // console.log("getUserName", participant, fname)
        orgName = participant.getProperty('ORGNAME') !== "" ? ' - ' + participant.getProperty('ORGNAME') : "";
    }
    else {// getFakeSigninUsers test
        fname = participant.FNAME
        lname = participant.LNAME
        const org = participant.ORG;
        orgName = org ? ' - ' + org.NAME : "";
    }
    return `${fname} ${lname}${withOrg ? orgName : ""}`
}
export const getParticipantId = (participant) => {
    if (!participant) return -1;
    if (participant.getId) return participant.getId();
    if (participant.USER_ID) return participant.USER_ID;
    return -1;
}
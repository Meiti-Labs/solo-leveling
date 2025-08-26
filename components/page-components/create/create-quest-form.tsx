import * as React from 'react';

interface ICreateQuestFormProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateQuestForm: React.FunctionComponent<ICreateQuestFormProps> = ({setOpen}) => {
  return <>sALAM NOKARETAM <button onClick={()=> setOpen(false)}>ey baba</button></> ;
};

export default CreateQuestForm;

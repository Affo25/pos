import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllGuardians } from '../../redux/guardians/guardianSlice';
import SelectableTableModal from '../../config/default/SelectableTableModal';

function GuardiansTab() {
  const dispatch = useDispatch();
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { guardians } = useSelector((state) => state.guardians);

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllGuardians(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  const guardianColumns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Father Name', dataIndex: 'fatherName' },
    { title: 'Identity No', dataIndex: 'identityNo' },
    { title: 'Contact No', dataIndex: 'contactNo' },
  ];

  return (
    <SelectableTableModal
      title="Guardians"
      data={guardians}
      columns={guardianColumns}
      searchKey="name"
      addButtonText="Add Guardian"
    />
  );
}

export default GuardiansTab;

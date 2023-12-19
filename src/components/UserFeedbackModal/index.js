import {
  Fragment,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Select from "react-select";
import { useSelector } from 'react-redux';

const UserFeedbackModal = forwardRef((props, ref) => {
  let notificationTypes = [...useSelector((state) => state.notification.notificationTypes)];
  const severities = useSelector((state) => state.notification.severities);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationType, setNotificationType] = useState();
  const [severity, setSeverity] = useState();
  const cancelButtonRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("");
  const dialogRef = useRef(null);

  const closeModal = (result) => {
    setIsOpen(false);
    props.SaveFeedbackCallback(result, notificationType, severity);
  };

  const openModal = (event) => {
    const notificationType = notificationTypes.find(
      (option) => option.value === event.notification_type
    );

    setNotificationType(notificationType);
    setSeverity(event.severity);
    setIsOpen(true);

    const selectedOption = severities.find(
      (option) => option.value === event.severity
    );

    setSelectedColor(selectedOption.color);
  };

  useImperativeHandle(ref, () => ({
    openModal,
  }));

  const handleNotificationTypeSelectChange = (selectedOption) => {
    setNotificationType(selectedOption);
  };

  const handleSeveritySelectChange = (e) => {
    e.preventDefault();
    const selectedOption = severities.find(
      (option) => option.value === e.target.value
    );

    setSeverity(selectedOption.value);
    setSelectedColor(selectedOption.color);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
      ref={dialogRef}
        as="div"
        className="relative z-10 your-dialog-content-class"
        initialFocus={cancelButtonRef}
        onClose={closeModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white m-1 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex flex-shrink-0 items-center justify-center rounded-full bg-gray-300 sm:mx-0 sm:h-8 sm:w-8">
                      <InformationCircleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-center sm:ml-2 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="pt-0 text-base font-semibold leading-6 text-gray-900"
                      >
                        Help us to improve it!
                      </Dialog.Title>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">
                      What did you see in the event?
                    </p>
                    <div className="inset-0 items-center justify-center">
                      <div className="p-2">
                        <Select
                        style="overflow: visible"
                        name={"notificationTypes"}
                          placeholder={"Select an option"}
                          className="text-sm  rounded-lg"
                          onChange={handleNotificationTypeSelectChange}
                          options={notificationTypes.sort((a, b) =>
                            a.label.localeCompare(b.label)
                          )}
                          value={notificationType}
                          isSearchable ={true}                          
                        />                        
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md mt-3">
                      <p className="text-sm text-gray-500">
                        How do you classify the event?
                      </p>
                      <div  className="pt-2">
                      <select
                        id="severity"
                        className=" w-full border-gray-300 border py-2 pl-3 rounded-lg text-sm text-gray-900"
                        value={severity}
                        onChange={handleSeveritySelectChange}
                        style={{ color: selectedColor }}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {severities.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            style={{ color: option.color }}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-[#26272f] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4f5263] sm:ml-3 sm:w-auto"
                    onClick={() => closeModal(true)}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => closeModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

export default UserFeedbackModal;

import {
  Fragment,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const UserFeedbackModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState({ notification_type: "" });
  const cancelButtonRef = useRef(null);

  const notificationTypes = [
    { label: "Item Picking", value: "item_picking" },
    { label: "Bagging", value: "bagging" },
    { label: "Pocketing", value: "pocketing" },
    { label: "Enter Store", value: "enter_store" },
    { label: "Leave Store", value: "leave_store" },
    { label: "Pay Or Checkout", value: "pay/checkout" },
    { label: "Normal", value: "normal" },
    { label: "Shoplift", value: "shoplift" },
  ];

  const severities = [
    { label: "Information", value: "INFORMATION" },
    { label: "Warning", value: "WARNING" },
    { label: "Critical", value: "CRITICAL" },
  ];

  const closeModal = (result) => {
    setIsOpen(false);
    props.SaveFeedbackCallback(result, event);
  };

  const openModal = (event) => {
    setEvent(event);
    setIsOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openModal,
  }));

  const handleNotificationTypeSelectChange = (e) => {
    const selectedOption = notificationTypes.find(
      (option) => option.value === e.target.value
    );
    event.notification_type = selectedOption.value;

    setEvent(event);
  };

  const handleSeveritySelectChange = (e) => {
    const selectedOption = severities.find(
      (option) => option.value === e.target.value
    );
    event.severity = selectedOption.value;

    setEvent(event);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 sm:mx-0 sm:h-10 sm:w-10">
                      <InformationCircleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Help us to improve it!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          What did you see in the event?
                        </p>
                        <div className="relative mt-1">
                          <select
                            id="notificationType"
                            className="border-none rounded-xl w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900"
                            value={event.notification_type}
                            onChange={handleNotificationTypeSelectChange}
                          >
                            <option value="" disabled>
                              Select an option
                            </option>
                            {notificationTypes.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="text-sm text-gray-500">
                          How do you classify the event?
                        </p>
                        <select
                          id="severity"
                          className=" w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900"
                          value={event.severity}
                          onChange={handleSeveritySelectChange}
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {severities.map((option) => (
                            <option key={option.value} value={option.value}>
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

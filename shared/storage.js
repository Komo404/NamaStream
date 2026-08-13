export function get(keys) 
{
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result));
  });
}

export function set(obj) 
{
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => resolve());
  });
}

export function onChanged(listener) 
{
  chrome.storage.onChanged.addListener(listener);
}
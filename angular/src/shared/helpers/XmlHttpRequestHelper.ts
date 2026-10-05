export class XmlHttpRequestHelper {

    static ajax(
        type: string,
        url: string,
        customHeaders: any,
        data: any,
        success: any,
        error?: (failure: Error) => void,
        timeout = 30000
    ) {
        let xhr = new XMLHttpRequest();
        let completed = false;

        const fail = (message: string) => {
            if (completed) {
                return;
            }

            completed = true;
            const failure = new Error(message);

            if (error) {
                error(failure);
            } else {
                alert(abp.localization.localize('InternalServerError', 'AbpWeb'));
            }
        };

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && !completed) {
                if (xhr.status === 200) {
                    let result: any;
                    try {
                        result = JSON.parse(xhr.responseText);
                    } catch {
                        fail('The server returned an invalid response.');
                        return;
                    }
                    completed = true;
                    success(result);
                } else {
                    fail(`Request failed with status ${xhr.status}.`);
                }
            }
        };

        xhr.onerror = () => fail('The server could not be reached.');
        xhr.onabort = () => fail('The request was aborted.');
        xhr.ontimeout = () => fail('The request timed out.');

        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'd=' + new Date().getTime();
        xhr.open(type, url, true);
        xhr.timeout = timeout;

        for (let property in customHeaders) {
            if (customHeaders.hasOwnProperty(property)) {
                xhr.setRequestHeader(property, customHeaders[property]);
            }
        }

        xhr.setRequestHeader('Content-type', 'application/json');
        if (data) {
            xhr.send(data);
        } else {
            xhr.send();
        }
    }
}

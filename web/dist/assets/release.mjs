export function validateRelease(data){
 if(!data||data.packageName!=='io.github.phantom.gps'||!/^v\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(data.version)||!Number.isSafeInteger(data.versionCode)||data.versionCode<=0)throw Error('Invalid version');
 if(data.filename!==`PHANToM-GPS-${data.version}.apk`||!Number.isSafeInteger(data.bytes)||data.bytes<=0||data.bytes>100*1024*1024||!/^[a-fA-F0-9]{64}$/.test(data.sha256))throw Error('Invalid file');
 if(typeof data.publishedAt!=='string'||!Number.isFinite(Date.parse(data.publishedAt))||!Array.isArray(data.changes)||data.changes.length>20||data.changes.some(x=>typeof x!=='string'||x.length>1000))throw Error('Invalid details');
 return data;
}
